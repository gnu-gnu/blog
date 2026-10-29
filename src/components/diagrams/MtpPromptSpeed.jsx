// RTX PRO 6000, 비추론, 프롬프트별 생성 속도(tok/s, 2회 평균). 괄호는 MTP 없음 대비 배수.
const PROMPTS = [
  { label: '한국어 일상 대화', base: 38.6, orig: 31.4, mtp: 50.7 },
  { label: '영어 일상 대화', base: 38.7, orig: 32.9, mtp: 66.2 },
  { label: '코드 리뷰 (입력 1.6k 토큰)', base: 36.1, orig: 31.3, mtp: 57.1 },
  { label: '영문 문서 요약 (입력 1만 토큰)', base: 31.6, orig: 26.8, mtp: 48.3 },
  { label: '코드 생성', base: 38.6, orig: 32.8, mtp: 84.3 },
];
const X0 = 20;
const SCALE = 5.8;
const BAR_H = 24;
const GAP = 6;
const HEAD = 34;
const GROUP_H = HEAD + 3 * (BAR_H + GAP) + 26;
const TOP = 82;

export default function MtpPromptSpeed() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const axis = 'var(--cds-chart-axis)';
  const accent = 'var(--cds-chart-categorical-1)';
  const tint = 'var(--cds-chart-reference-tint)';
  const bars = [
    { key: 'base', name: 'MTP 없음', fill: axis, stroke: 'none' },
    { key: 'orig', name: '원래 MTP', fill: tint, stroke: axis },
    { key: 'mtp', name: '새 MTP', fill: accent, stroke: 'none' },
  ];
  const H = TOP + PROMPTS.length * GROUP_H;
  return (
    <svg viewBox={`0 0 760 ${H}`} role="img" aria-labelledby="mps-title mps-desc">
      <title id="mps-title">비추론 모드의 프롬프트별 생성 속도</title>
      <desc id="mps-desc">
        MTP 없음, 원래 MTP, 새 MTP 순서. 한국어 일상 대화 38.6, 31.4, 50.7. 영어 일상 대화 38.7, 32.9, 66.2.
        코드 리뷰 36.1, 31.3, 57.1. 영문 문서 요약 31.6, 26.8, 48.3. 코드 생성 38.6, 32.8, 84.3 tok/s.
      </desc>
      {bars.map((b, i) => (
        <g key={b.key}>
          <rect x={20 + i * 170} y="22" width="20" height="20" rx="3" fill={b.fill} stroke={b.stroke} strokeWidth="1.5" />
          <text x={50 + i * 170} y="40" fill={muted} fontSize="20">{b.name}</text>
        </g>
      ))}
      {PROMPTS.map((p, gi) => {
        const gy = TOP + gi * GROUP_H;
        return (
          <g key={p.label}>
            <text x={X0} y={gy + 22} fill={text} fontSize="21" fontWeight="600">{p.label}</text>
            {bars.map((b, bi) => {
              const v = p[b.key];
              const y = gy + HEAD + bi * (BAR_H + GAP);
              const label = b.key === 'base' ? v.toFixed(1) : `${v.toFixed(1)} (${(v / p.base).toFixed(2)}×)`;
              return (
                <g key={b.key}>
                  <rect x={X0} y={y} width={v * SCALE} height={BAR_H} rx="3" fill={b.fill} stroke={b.stroke} strokeWidth="1.5" />
                  <text x={X0 + v * SCALE + 10} y={y + BAR_H - 4} fill={b.key === 'mtp' ? text : muted} fontSize="20" fontWeight={b.key === 'mtp' ? '700' : '400'}>{label}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
