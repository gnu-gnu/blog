// 35B-A3B 실제 프롬프트 12개 × top-k 8/4: 요청별 토큰당 NVMe 읽기와 토큰당 decode 시간, 최소제곱 직선.
const K8 = [
  [190.7, 320.5], [256.4, 355.4], [256.2, 369.1], [252.7, 355.9], [190.4, 322.4], [316.8, 366.8],
  [260.0, 351.7], [322.2, 416.7], [276.9, 373.1], [350.7, 415.3], [247.0, 343.2], [372.4, 448.0],
];
const K4 = [
  [57.4, 232.1], [87.7, 245.5], [97.9, 260.7], [97.3, 250.4], [59.3, 229.6], [118.3, 283.4],
  [90.1, 247.2], [129.6, 273.1], [93.6, 252.1], [164.5, 280.8], [88.6, 244.6], [139.3, 308.2],
];
const A = 193.3;
const B = 0.644;
const X0 = 110;
const W = 610;
const Y0 = 440;
const H = 360;
const px = (v) => X0 + (v / 400) * W;
const py = (v) => Y0 - (v / 500) * H;

export default function DecodeFixedCost() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  const axis = 'var(--cds-chart-axis)';
  const c8 = 'var(--cds-chart-categorical-1)';
  const c4 = 'var(--cds-chart-categorical-2)';
  return (
    <svg viewBox="0 0 760 540" role="img" aria-labelledby="dfc-title dfc-desc">
      <title id="dfc-title">토큰당 NVMe 읽기와 decode 시간</title>
      <desc id="dfc-desc">
        top-k 8 요청 12개는 토큰당 190~372 MiB를 읽고 321~448 ms가 걸렸고, top-k 4 요청 12개는 57~165 MiB에 230~308 ms였다.
        24개 점은 한 직선(193 ms + 0.64 ms/MiB, 상관계수 0.98)에 놓인다. 읽기가 0이어도 토큰당 약 193 ms가 남는다.
      </desc>
      <circle cx="40" cy="34" r="8" fill={c8} stroke="var(--surface)" strokeWidth="2" />
      <text x="56" y="41" fill={muted} fontSize="20">top-k 8</text>
      <rect x="172" y="26" width="16" height="16" rx="2" fill={c4} stroke="var(--surface)" strokeWidth="2" />
      <text x="196" y="41" fill={muted} fontSize="20">top-k 4</text>
      <text x="320" y="41" fill={muted} fontSize="20">점 하나 = 요청 하나</text>

      {[0, 100, 200, 300, 400, 500].map((v) => (
        <g key={v}>
          <line x1={X0} x2={X0 + W} y1={py(v)} y2={py(v)} stroke={grid} strokeWidth="1" />
          <text x={X0 - 14} y={py(v) + 7} textAnchor="end" fill={muted} fontSize="20">{v}</text>
        </g>
      ))}
      {[0, 100, 200, 300, 400].map((v) => (
        <text key={v} x={px(v)} y={Y0 + 34} textAnchor="middle" fill={muted} fontSize="20">{v}</text>
      ))}
      <line x1={X0} x2={X0 + W} y1={Y0} y2={Y0} stroke={axis} strokeWidth="2" />
      <text x={X0 + W / 2} y="520" textAnchor="middle" fill={muted} fontSize="20">요청 전체 NVMe 읽기 ÷ 생성 토큰 (MiB)</text>
      <text x="20" y={py(500) - 16} fill={muted} fontSize="20">ms/토큰</text>

      <line x1={px(0)} y1={py(A)} x2={px(400)} y2={py(A + B * 400)} stroke={muted} strokeWidth="2" strokeDasharray="7 6" />
      <circle cx={px(0)} cy={py(A)} r="6" fill={muted} />
      <text x={px(0) + 16} y={py(A) + 32} fill={text} fontSize="21" fontWeight="600">읽기 0일 때 193 ms</text>
      <text x={px(400)} y={py(470)} textAnchor="end" fill={text} fontSize="21">193 ms + 0.64 ms/MiB, r = 0.98</text>

      {K8.map(([x, y], i) => (
        <circle key={`a${i}`} cx={px(x)} cy={py(y)} r="8" fill={c8} stroke="var(--surface)" strokeWidth="2" />
      ))}
      {K4.map(([x, y], i) => (
        <rect key={`b${i}`} x={px(x) - 8} y={py(y) - 8} width="16" height="16" rx="2" fill={c4} stroke="var(--surface)" strokeWidth="2" />
      ))}
    </svg>
  );
}
