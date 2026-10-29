// 35B-A3B 단계별 요청 12개의 decode 속도. 굵은 세로선은 평균.
const ROWS = [
  { label: '① 기본', v: [3.12, 2.814, 2.709, 2.81, 3.102, 2.726, 2.843, 2.4, 2.68, 2.408, 2.914, 2.232] },
  { label: '② GPU 하한', v: [4.146, 3.487, 3.38, 3.426, 3.532, 3.361, 3.317, 3.083, 3.441, 2.805, 3.64, 2.86] },
  { label: '③ expert 캐시', v: [4.875, 4.178, 4.389, 4.429, 5.004, 4.276, 4.219, 3.953, 4.602, 3.986, 4.526, 4.21] },
  { label: '④ 순서·스레드', v: [5.317, 4.697, 4.783, 4.921, 5.38, 4.796, 5.105, 4.709, 5.069, 4.66, 5.391, 4.703] },
];
const X0 = 220;
const W = 500;
const LO = 2;
const HI = 6;
const px = (v) => X0 + ((v - LO) / (HI - LO)) * W;
const TOP = 90;
const ROW_H = 86;

export default function StepPromptSpread() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  const axis = 'var(--cds-chart-axis)';
  const C = ['var(--cds-chart-categorical-3)', 'var(--cds-chart-categorical-2)', 'var(--cds-chart-categorical-4)', 'var(--cds-chart-categorical-1)'];
  const bottom = TOP + ROWS.length * ROW_H - 30;
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  return (
    <svg viewBox={`0 0 760 ${bottom + 86}`} role="img" aria-labelledby="sps-title sps-desc">
      <title id="sps-title">단계별 요청 12개의 decode 속도</title>
      <desc id="sps-desc">
        ① 기본 2.23~3.12 tok/s(평균 2.73), ② GPU 하한 2.81~4.15(3.37), ③ expert 캐시 3.95~5.00(4.39), ④ 순서·스레드 조정 4.66~5.39(4.96).
        ④의 가장 느린 요청(4.66)이 ②의 가장 빠른 요청(4.15)보다 빠르다.
      </desc>
      <text x="20" y="40" fill={muted} fontSize="20">점 = 요청 하나 · 세로선 = 평균</text>
      {[2, 3, 4, 5, 6].map((v) => (
        <g key={v}>
          <line x1={px(v)} x2={px(v)} y1={TOP - 34} y2={bottom} stroke={grid} strokeWidth="1" />
          <text x={px(v)} y={bottom + 32} textAnchor="middle" fill={muted} fontSize="20">{v}</text>
        </g>
      ))}
      <line x1={X0} x2={X0 + W} y1={bottom} y2={bottom} stroke={axis} strokeWidth="2" />
      <text x={X0 + W / 2} y={bottom + 68} textAnchor="middle" fill={muted} fontSize="20">decode (tok/s)</text>
      <line x1={px(4.146)} x2={px(4.146)} y1={TOP + ROW_H - 26} y2={TOP + 3 * ROW_H + 26} stroke={axis} strokeWidth="1.5" strokeDasharray="5 5" />
      <text x={px(4.146) - 8} y={TOP + 3 * ROW_H + 50} textAnchor="end" fill={muted} fontSize="20">② 최고 4.15</text>

      {ROWS.map((r, i) => {
        const y = TOP + i * ROW_H;
        const m = mean(r.v);
        return (
          <g key={r.label}>
            <text x="20" y={y + 7} fill={text} fontSize="21">{r.label}</text>
            {r.v.map((v, j) => (
              <circle key={j} cx={px(v)} cy={y + ((j % 3) - 1) * 9} r="7" fill={C[i]} stroke="var(--surface)" strokeWidth="2" />
            ))}
            <line x1={px(m)} x2={px(m)} y1={y - 26} y2={y + 26} stroke={text} strokeWidth="3" />
          </g>
        );
      })}
    </svg>
  );
}
