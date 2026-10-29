// RTX PRO 6000, vLLM v0.31.0, EXAONE-4.5-33B FP8, 자연 프롬프트 5개 × 2회 평균(tok/s)과 수용률.
// 배수는 반올림 전 평균으로 계산한다. MTP 없음은 추론 모드와 관계없이 같은 속도라 기준선 하나로 그린다.
const BASE = 36.70;
const GROUPS = [
  {
    name: '비추론',
    rows: [
      { label: '원래 MTP', v: 31.03, acc: '0.8%' },
      { label: '새 MTP', v: 61.31, acc: '33.7%', strong: true },
    ],
  },
  {
    name: '추론',
    rows: [
      { label: '원래 MTP', v: 55.4, acc: '28.3%' },
      { label: '새 MTP', v: 54.5, acc: '27.2%', strong: true },
    ],
  },
];
const X0 = 150;
const SCALE = 5.6;
const x = (v) => X0 + v * SCALE;
const BAR_H = 40;
const ROW_H = 92;
const GROUP_H = 236;
const TOP = 96;

export default function MtpModeSpeed() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const axis = 'var(--cds-chart-axis)';
  const accent = 'var(--cds-chart-categorical-1)';
  const bottom = TOP + GROUPS.length * GROUP_H - 30;
  return (
    <svg viewBox={`0 0 760 ${bottom + 70}`} role="img" aria-labelledby="mms-title mms-desc">
      <title id="mms-title">추론 모드별 EXAONE 4.5 33B 생성 속도</title>
      <desc id="mms-desc">
        MTP 없음은 36.7 tok/s. 비추론에서 원래 MTP는 31.0 tok/s(0.85배, 수용률 0.8%), 새 MTP는 61.3 tok/s(1.67배, 수용률 33.7%).
        추론에서 원래 MTP는 55.4 tok/s(1.51배, 수용률 28.3%), 새 MTP는 54.5 tok/s(1.49배, 수용률 27.2%).
      </desc>
      <rect x="20" y="22" width="20" height="20" rx="3" fill="var(--cds-chart-reference-tint)" stroke={axis} strokeWidth="1.5" />
      <text x="50" y="40" fill={muted} fontSize="20">원래 MTP</text>
      <rect x="180" y="22" width="20" height="20" rx="3" fill={accent} />
      <text x="210" y="40" fill={muted} fontSize="20">새 MTP (헤드 재학습)</text>
      <line x1="460" x2="500" y1="32" y2="32" stroke={muted} strokeWidth="2" strokeDasharray="6 5" />
      <text x="510" y="40" fill={muted} fontSize="20">MTP 없음</text>

      <line x1={X0} x2={X0} y1={TOP - 10} y2={bottom} stroke={axis} strokeWidth="2" />
      <line x1={x(BASE)} x2={x(BASE)} y1={TOP - 10} y2={bottom} stroke={muted} strokeWidth="2" strokeDasharray="6 5" />
      <text x={x(BASE)} y={bottom + 34} textAnchor="middle" fill={muted} fontSize="20">MTP 없음 {BASE.toFixed(1)} tok/s</text>

      {GROUPS.map((g, gi) => {
        const gy = TOP + gi * GROUP_H;
        return (
          <g key={g.name}>
            <text x="20" y={gy + 14} fill={text} fontSize="22" fontWeight="700">{g.name}</text>
            {g.rows.map((r, ri) => {
              const y = gy + 34 + ri * ROW_H;
              const ratio = (r.v / BASE).toFixed(2);
              const lx = Math.max(x(r.v), x(BASE)) + 12;
              return (
                <g key={r.label}>
                  <text x={X0 - 12} y={y + BAR_H / 2 + 7} textAnchor="end" fill={r.strong ? text : muted} fontSize="20">{r.label}</text>
                  <rect
                    x={X0}
                    y={y}
                    width={r.v * SCALE}
                    height={BAR_H}
                    rx="3"
                    fill={r.strong ? accent : 'var(--cds-chart-reference-tint)'}
                    stroke={r.strong ? 'none' : axis}
                    strokeWidth="1.5"
                  />
                  <text x={lx} y={y + 17} fill={text} fontSize="21" fontWeight={r.strong ? '700' : '500'}>
                    {r.v.toFixed(1)} tok/s ({ratio}×)
                  </text>
                  <text x={lx} y={y + 43} fill={muted} fontSize="20">수용률 {r.acc}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
