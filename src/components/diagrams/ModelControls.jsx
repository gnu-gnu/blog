// 모델 6종에 같은 설정을 적용: 기본 대비 decode 배수. ② GPU 하한, ④ 하한 + expert 캐시 + -t 4.
const ROWS = [
  { label: 'Gemma 4 E2B', sub: 'dense', f: 1.0015, c: 1.0013 },
  { label: 'Gemma 4 E4B', sub: 'dense', f: 0.9982, c: 1.0042 },
  { label: 'Qwen3.5-9B', sub: 'dense', f: 0.9984, c: 0.9997 },
  { label: 'LFM2-8B-A1B', sub: 'MoE · 상주', f: 1.0004, c: 1.0004 },
  { label: 'gpt-oss-20b', sub: 'MoE · 오프로드', f: 1.3864, c: 0.9399 },
  { label: 'Qwen3.6-35B-A3B', sub: 'MoE · 오프로드', f: 1.2355, c: 1.8172 },
];
const X0 = 300;
const W = 420;
const LO = 0.8;
const HI = 2.0;
const px = (v) => X0 + ((v - LO) / (HI - LO)) * W;
const TOP = 100;
const ROW_H = 70;

export default function ModelControls() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  const axis = 'var(--cds-chart-axis)';
  const cf = 'var(--cds-chart-categorical-2)';
  const cc = 'var(--cds-chart-categorical-1)';
  const bottom = TOP + ROWS.length * ROW_H - 30;
  const fmt = (v) => `×${v.toFixed(2)}`;
  return (
    <svg viewBox={`0 0 760 ${bottom + 86}`} role="img" aria-labelledby="mc-title mc-desc">
      <title id="mc-title">모델별 GPU 하한과 expert 캐시의 효과</title>
      <desc id="mc-desc">
        기본 대비 decode 배수. dense 3종과 메모리에 상주하는 LFM2-8B-A1B는 GPU 하한, 캐시 모두 ×1.00 (±0.5% 이내).
        gpt-oss-20b는 GPU 하한 ×1.39, 캐시까지 적용 시 ×0.94. Qwen3.6-35B-A3B는 GPU 하한 ×1.24, 캐시까지 ×1.82.
      </desc>
      <rect x="22" y="26" width="16" height="16" rx="2" fill={cf} stroke="var(--surface)" strokeWidth="2" />
      <text x="48" y="41" fill={muted} fontSize="20">② GPU 하한</text>
      <circle cx="210" cy="34" r="8" fill={cc} stroke="var(--surface)" strokeWidth="2" />
      <text x="226" y="41" fill={muted} fontSize="20">④ 하한 + 캐시 + -t 4</text>

      {[0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map((v) => (
        <g key={v}>
          <line x1={px(v)} x2={px(v)} y1={TOP - 34} y2={bottom} stroke={v === 1 ? axis : grid} strokeWidth={v === 1 ? 2 : 1} strokeDasharray={v === 1 ? '6 5' : undefined} />
          <text x={px(v)} y={bottom + 32} textAnchor="middle" fill={muted} fontSize="20">{v.toFixed(1)}</text>
        </g>
      ))}
      <text x={X0 + W / 2} y={bottom + 68} textAnchor="middle" fill={muted} fontSize="20">① 기본 대비 decode 배수</text>

      {ROWS.map((r, i) => {
        const y = TOP + i * ROW_H;
        const moved = Math.abs(r.f - 1) > 0.05 || Math.abs(r.c - 1) > 0.05;
        return (
          <g key={r.label}>
            <text x="20" y={y - 2} fill={text} fontSize="21">{r.label}</text>
            <text x="20" y={y + 24} fill={muted} fontSize="20">{r.sub}</text>
            <rect x={px(r.f) - 8} y={y - 8 - 9} width="16" height="16" rx="2" fill={cf} stroke="var(--surface)" strokeWidth="2" />
            <circle cx={px(r.c)} cy={y + 9} r="8" fill={cc} stroke="var(--surface)" strokeWidth="2" />
            {moved && (
              <>
                <text x={px(r.f) + (r.f > r.c ? 16 : -16)} y={y - 2} textAnchor={r.f > r.c ? 'start' : 'end'} fill={text} fontSize="20">{fmt(r.f)}</text>
                <text x={px(r.c) + (r.c > r.f ? 16 : -16)} y={y + 26} textAnchor={r.c > r.f ? 'start' : 'end'} fill={text} fontSize="20" fontWeight="600">{fmt(r.c)}</text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
