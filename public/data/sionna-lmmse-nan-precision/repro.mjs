// Sionna LMMSEInterpolator1D의 스케일 식을 JS 수식 수준에서 재연한다.
// 대상 식: channel_estimation.py (Sionna 1.2.2) 1142~1152행.
// 복소수는 [re, im]. complex64는 연산마다 Math.fround로 float32 반올림해 흉내 낸다.
// TF/Eigen 커널을 재현하는 코드가 아니라 식의 부동소수점 동작만 본다.
import { readFileSync } from 'node:fs';

const measured = JSON.parse(readFileSync(new URL('./measured-diagonals.json', import.meta.url)));
const f32 = Math.fround, f64 = (x) => x;

const ops = (r) => ({
  add: (a, b) => [r(a[0] + b[0]), r(a[1] + b[1])],
  sub: (a, b) => [r(a[0] - b[0]), r(a[1] - b[1])],
  mul: (a, b) => [r(r(a[0] * b[0]) - r(a[1] * b[1])), r(r(a[0] * b[1]) + r(a[1] * b[0]))],
  // Smith 방식. 단순 공식은 c²+d²가 float32에서 0으로 언더플로한다.
  div: (a, b) => {
    const [c, d] = b;
    if (Math.abs(c) < Math.abs(d)) {
      const q = r(c / d), den = r(r(c * q) + d);
      return [r(r(r(a[0] * q) + a[1]) / den), r(r(r(a[1] * q) - a[0]) / den)];
    }
    const q = r(d / c), den = r(c + r(d * q));
    return [r(r(a[0] + r(a[1] * q)) / den), r(r(a[1] - r(a[0] * q)) / den)];
  },
});

// 파일럿 없는 행: ext_mat=0 이므로 h_hat_var=0, err_var=Re(R_kk) (1096행).
function pilotlessRow(re, im, r = f32) {
  const c = ops(r);
  const hVar = [r(re), r(im)];            // 1142행: diag_part 그대로, 실수부를 취하지 않음
  const errC = [r(re), 0];
  const hHatVar = [0, 0];
  const denom = c.sub(c.add(hHatVar, hVar), errC);
  const num = [r(2 * hVar[0]), r(2 * hVar[1])];
  // 1143행 divide_no_nan: 분모가 정확히 0일 때만 0
  const s = denom[0] === 0 && denom[1] === 0 ? [0, 0] : c.div(num, denom);
  const sTimes = c.mul(s, c.sub(s, [1, 0]));
  const err = c.add(c.add(c.mul(sTimes, hHatVar), c.mul(c.sub([1, 0], s), hVar)), c.mul(s, errC)); // 1151행
  return { denom, s, sTimes, err: err[0] };
}
const fmt = (x) => (Number.isFinite(x) ? x.toExponential(3) : String(x));
const row = (label, re, im, r = f32) => {
  const o = pilotlessRow(re, im, r);
  const absS = Math.hypot(o.s[0], o.s[1]);
  console.log(`${label.padEnd(34)} im=${fmt(im).padEnd(11)} |s|=${fmt(absS).padEnd(11)} s(s-1).re=${fmt(o.sTimes[0]).padEnd(11)} err=${fmt(o.err)}`);
  return o;
};

console.log('--- 1. JS 맛보기: 0이어야 할 값, === 0 가드, Infinity*0');
console.log('0.1+0.2-0.3 =', 0.1 + 0.2 - 0.3, '/ === 0 ?', 0.1 + 0.2 - 0.3 === 0);
console.log('fround(1e20)*fround(1e20) in float32 =', f32(f32(1e20) * f32(1e20)), '/ *0 =', f32(f32(1e20) * f32(1e20)) * 0);
console.log('fround(1e-21) =', f32(1e-21), '/ fround(1+1e-21) =', f32(1 + 1e-21));

console.log('\n--- 2. 저장 공분산의 실제 대각값을 식에 넣음 (float32)');
const R = measured['complex128-accum'].re;
row('complex64-accum 최소 잔여 (complex64 누적)', measured['complex64-accum'].re, measured['complex64-accum'].im);
row('complex128-accum 최소 잔여 (complex128 누적)', measured['complex128-accum'].re, measured['complex128-accum'].im);
console.log('Sionna 관측값 |s| max = 2.5654985e25 (nan-repro summary)');

console.log('\n--- 3. 비단조성: 잔여물 크기를 바꿈 (float32, R=complex128-accum)');
for (const e of [1e-5, 1e-8, 1e-10, 1e-15, 1e-18, 1e-19, 1e-20, 1e-21, 1e-25]) row('', R, e);
row('허수부 정확히 0', R, 0);
let lo = 1e-25, hi = 1e-15;
for (let i = 0; i < 200; i++) { const m = Math.sqrt(lo * hi); Number.isNaN(pilotlessRow(R, f32(m)).err) ? lo = m : hi = m; }
console.log(`NaN 경계 |ε| ≈ ${hi.toExponential(3)} (= ${(hi / R).toExponential(3)} × R)`);

console.log('\n--- 4. 같은 입력을 double로 (JS 기본 number)');
row('complex128-accum 최소 잔여, float64', measured['complex128-accum'].re, measured['complex128-accum'].im, f64);
row('ε=1e-160, float64', R, 1e-160, f64);

console.log('\n--- 5. 전파: NaN*마스크0, 같은 인덱스 누적');
const nanErr = pilotlessRow(measured['complex128-accum'].re, measured['complex128-accum'].im).err;
console.log('err * mask(0) =', nanErr * 0);
const a00 = Array.from({ length: 2880 }, () => nanErr * 0).reduce((x, y) => x + y, 0.1);
console.log('a[0][0] + (NaN 2880개) =', a00);

console.log('\n--- 6. 3×3 시스템 풀이: JS 소거법 vs Sionna 관측');
function solve(Ain, bin) {
  const A = Ain.map((r) => [...r]), b = [...bin], n = b.length;
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let j = i + 1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[p][i])) p = j;
    [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
    for (let j = i + 1; j < n; j++) { const q = A[j][i] / A[i][i]; for (let k = i; k < n; k++) A[j][k] -= q * A[i][k]; b[j] -= q * b[i]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let t = b[i]; for (let k = i + 1; k < n; k++) t -= A[i][k] * x[k]; x[i] = t / A[i][i]; }
  return x;
}
const A3 = [[1.645, 1.5, 1.3], [1.5, 1.645, 1.5], [1.3, 1.5, 1.645]];
console.log('정상 A[0][0]    :', solve(A3, [1, 1, 1]).map((v) => v.toFixed(4)).join(' '));
const A3n = A3.map((r) => [...r]); A3n[0][0] = NaN;
console.log('A[0][0]=NaN (JS):', solve(A3n, [1, 1, 1]).join(' '));
console.log('Sionna 관측     : ext_mat 유한, 0번 부반송파 h_hat 전부 0, err_var 유한 → 출력 검사 통과');

console.log('\n--- 7. 잔여물 생성: h·conj(h) 대각 허수부');
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function residual(r, sameOrder, N, seed, M = 13) {
  const u = mulberry32(seed), g = () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
  let total = 0;
  const re = new Float64Array(M), im = new Float64Array(M);
  for (let n = 0; n < N; n++) {
    for (let m = 0; m < M; m++) { re[m] = r(g() * 0.895); im[m] = r(g() * 0.895); }
    let p = 0, q = 0;
    for (let m = 0; m < M; m++) p = r(p + r(im[m] * re[m]));
    for (let m = 0; m < M; m++) { const j = sameOrder ? m : M - 1 - m; q = r(q + r(re[j] * im[j])); }
    total = r(total + r(r(p - q) / M));
  }
  return r(total / N);
}
const N = 100020, K = 288;
const summary = (r, same) => { const v = []; for (let k = 0; k < K; k++) v.push(Math.abs(residual(r, same, N, 1000 + k))); const nz = v.filter((x) => x > 0); return `|ε| max=${fmt(Math.max(...v))} min(0 제외)=${nz.length ? fmt(Math.min(...nz)) : '-'} 0개수=${v.length - nz.length}/${K}`; };
console.log('float64, 같은 순서 합산   :', summary(f64, true));
console.log('float32, 같은 순서 합산   :', summary(f32, true));
console.log('float64, 다른 순서 합산   :', summary(f64, false));
console.log('float32, 다른 순서 합산   :', summary(f32, false));
console.log(`실측 complex128-accum (complex128): max=${fmt(measured['complex128-accum'].imag_max)} min=${fmt(measured['complex128-accum'].imag_min)}`);
console.log(`실측 complex64-accum (complex64) : max=${fmt(measured['complex64-accum'].imag_max)} min=${fmt(measured['complex64-accum'].imag_min)}`);
