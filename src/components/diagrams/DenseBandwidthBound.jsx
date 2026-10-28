// 덴스 3종의 tg128 실측과 대역폭 상한. 상한 = 실측 GPU 읽기 대역폭 81.4 GB/s ÷ CUDA0 가중치 버퍼.
const X0 = 210;
const W = 470;
const MAX = 60;
const px = (v) => (v / MAX) * W;

const ROWS = [
  { name: 'Gemma 4 E2B', color: 'var(--cds-chart-categorical-1)', tg: 29.6, bound: 55.1, eff: '54%', buf: '1.37 GiB' },
  { name: 'Gemma 4 E4B', color: 'var(--cds-chart-categorical-3)', tg: 15.3, bound: 26.9, eff: '57%', buf: '2.82 GiB' },
  { name: 'Qwen3.5-9B', color: 'var(--cds-chart-categorical-2)', tg: 13.6, bound: 17.8, eff: '77%', buf: '4.27 GiB' },
];

export default function DenseBandwidthBound() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  const axis = 'var(--cds-chart-axis)';
  return (
    <svg viewBox="0 0 760 470" role="img" aria-labelledby="dbb-title dbb-desc">
      <title id="dbb-title">덴스 모델의 decode 속도와 대역폭 상한</title>
      <desc id="dbb-desc">
        tg128 실측과 상한. Gemma 4 E2B 29.6 대 55.1 tok/s(54%), E4B 15.3 대 26.9(57%), Qwen3.5-9B 13.6 대 17.8(77%).
      </desc>
      <rect x="20" y="22" width="22" height="22" rx="4" fill={muted} />
      <text x="52" y="41" fill={muted} fontSize="20">실측 tg128</text>
      <rect x="200" y="22" width="22" height="22" rx="4" fill="none" stroke={muted} strokeWidth="2" strokeDasharray="5 4" />
      <text x="232" y="41" fill={muted} fontSize="20">상한 = 81.4 GB/s ÷ GPU 가중치 버퍼</text>

      {[0, 20, 40, 60].map((v) => (
        <g key={v}>
          <line x1={X0 + px(v)} x2={X0 + px(v)} y1="76" y2="400" stroke={grid} strokeWidth="1" />
          <text x={X0 + px(v)} y="430" textAnchor="middle" fill={muted} fontSize="20">{v}</text>
        </g>
      ))}
      <text x={X0 + W / 2} y="462" textAnchor="middle" fill={muted} fontSize="20">tok/s</text>

      {ROWS.map((r, i) => {
        const top = 92 + i * 104;
        return (
          <g key={r.name}>
            <text x="20" y={top + 30} fill={text} fontSize="22" fontWeight="600">{r.name}</text>
            <text x="20" y={top + 60} fill={muted} fontSize="20">버퍼 {r.buf}</text>
            <rect x={X0} y={top + 6} width={px(r.bound)} height="40" rx="4" fill="none" stroke={axis} strokeWidth="2" strokeDasharray="6 5" />
            <rect x={X0} y={top + 6} width={px(r.tg)} height="40" rx="4" fill={r.color} />
            <text x={X0 + px(r.bound) + 10} y={top + 34} fill={text} fontSize="21">{r.eff}</text>
            <text x={X0} y={top + 76} fill={muted} fontSize="20">{r.tg} / 상한 {r.bound}</text>
          </g>
        );
      })}
      <line x1={X0} x2={X0} y1="76" y2="400" stroke={axis} strokeWidth="2" />
    </svg>
  );
}
