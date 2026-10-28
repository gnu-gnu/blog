// decode 중 계산 스레드 6개의 상태 비율(5 ms 샘플링, 요청 2회). 진한 부분은 스레드별 최솟값, 옅은 부분은 최댓값까지다.
const X0 = 300;
const W = 400;
const px = (v) => X0 + (v / 100) * W;

const ROWS = [
  { label: '실행 (R)', lo: 37, hi: 45, color: 'var(--cds-chart-categorical-1)' },
  { label: 'I/O 대기 (D)', lo: 15, hi: 22, color: 'var(--cds-chart-categorical-4)' },
  { label: '대기 (S)', lo: 38, hi: 45, color: 'var(--cds-chart-axis)' },
];

export default function DecodeThreadTime() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  const axis = 'var(--cds-chart-axis)';
  const anyD = 'var(--cds-chart-categorical-2)';
  return (
    <svg viewBox="0 0 760 420" role="img" aria-labelledby="dtt-title dtt-desc">
      <title id="dtt-title">decode 중 계산 스레드의 시간 배분</title>
      <desc id="dtt-desc">
        스레드별로 실행 37~45%, I/O 대기 15~22%, 대기 38~45%. 하나 이상의 스레드가 I/O 대기 중인 시간은 decode 시간의 40~45%.
      </desc>
      <text x="20" y="38" fill={muted} fontSize="20">스레드 하나의 시간 중 비율 (스레드 6개의 범위)</text>
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={px(v)} x2={px(v)} y1="60" y2="340" stroke={grid} strokeWidth="1" />
          <text x={px(v)} y="372" textAnchor="middle" fill={muted} fontSize="20">{v}%</text>
        </g>
      ))}
      <line x1={px(0)} x2={px(0)} y1="60" y2="340" stroke={axis} strokeWidth="2" />
      {ROWS.map((r, i) => {
        const y = 92 + i * 62;
        return (
          <g key={r.label}>
            <text x="20" y={y + 8} fill={text} fontSize="22">{r.label}</text>
            <rect x={px(0)} y={y - 14} width={px(r.hi) - px(0)} height="28" rx="4" fill={r.color} opacity="0.35" />
            <rect x={px(0)} y={y - 14} width={px(r.lo) - px(0)} height="28" rx="4" fill={r.color} />
            <text x={px(r.hi) + 10} y={y + 8} fill={text} fontSize="20">{r.lo}~{r.hi}%</text>
          </g>
        );
      })}
      <line x1="20" x2="740" y1="268" y2="268" stroke={grid} strokeWidth="1" strokeDasharray="4 4" />
      <text x="20" y="312" fill={text} fontSize="22">1개 이상 D 상태</text>
      <rect x={px(0)} y="290" width={px(45) - px(0)} height="28" rx="4" fill={anyD} opacity="0.35" />
      <rect x={px(0)} y="290" width={px(40) - px(0)} height="28" rx="4" fill={anyD} />
      <text x={px(45) + 10} y="312" fill={text} fontSize="20">40~45% (decode 시간 기준)</text>
      <text x="380" y="408" textAnchor="middle" fill={muted} fontSize="20">S에는 GPU 연산 대기와 barrier 대기가 섞여 있다</text>
    </svg>
  );
}
