// expert 읽기 개선 실험: 같은 세션·같은 스레드 수의 패치 없는 기준값 대비 decode 변화(%).
// 가로 막대는 해당 조건 표준편차 ÷ 기준값. -t 12 행만 기준이 -t 6이다.
const ROWS = [
  { label: '-t 12 (기준 -t 6)', pts: [{ t: 12, v: 27.3, e: 8.2 }] },
  { label: 'MADV_WILLNEED', pts: [{ t: 6, v: 2.6, e: 9.0 }] },
  { label: 'pread 128K', pts: [{ t: 6, v: -14.4, e: 28.7 }, { t: 12, v: -26.1, e: 28.9 }] },
  { label: 'pread 128K + RANDOM', pts: [{ t: 6, v: 9.4, e: 2.5 }, { t: 12, v: -6.1, e: 3.4 }] },
  { label: 'pread 512K + RANDOM', pts: [{ t: 6, v: -8.8, e: 3.7 }, { t: 12, v: -20.9, e: 2.7 }] },
  { label: '비동기 로더 I/O×4', pts: [{ t: 12, v: 2.1, e: 5.7 }] },
  { label: '비동기 로더 I/O×8', pts: [{ t: 6, v: 7.3, e: 5.0 }, { t: 12, v: -7.0, e: 10.8 }] },
  { label: '비동기 로더 I/O×16', pts: [{ t: 12, v: -1.5, e: 6.4 }] },
  { label: 'GPU 캐시 512M', pts: [{ t: 12, v: -48.1, e: 3.1 }] },
  { label: 'GPU 캐시 1G', pts: [{ t: 12, v: -46.7, e: 5.9 }] },
  { label: 'GPU 캐시 2G', pts: [{ t: 12, v: -42.6, e: 6.2 }] },
];
const X0 = 270;
const W = 460;
const LO = -60;
const HI = 40;
const px = (v) => X0 + ((Math.max(LO, Math.min(HI, v)) - LO) / (HI - LO)) * W;
const ROW_H = 48;
const TOP = 96;

export default function ExpertReadExperiments() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  const axis = 'var(--cds-chart-axis)';
  const C = { 6: 'var(--cds-chart-categorical-1)', 12: 'var(--cds-chart-categorical-2)' };
  const bottom = TOP + ROWS.length * ROW_H;
  const mark = (t, x, y) =>
    t === 6 ? (
      <circle cx={x} cy={y} r="8" fill={C[6]} stroke="var(--surface)" strokeWidth="2" />
    ) : (
      <rect x={x - 8} y={y - 8} width="16" height="16" rx="2" fill={C[12]} stroke="var(--surface)" strokeWidth="2" />
    );
  return (
    <svg viewBox={`0 0 760 ${bottom + 76}`} role="img" aria-labelledby="ere-title ere-desc">
      <title id="ere-title">expert 읽기 개선 실험의 decode 변화</title>
      <desc id="ere-desc">
        같은 세션 기준값 대비 decode 변화. -t 12는 -t 6 대비 +27%. MADV_WILLNEED 6스레드 +3%(차이 없음).
        pread 128K는 6스레드 -14%, 12스레드 -26%로 편차가 컸다. readahead를 끈 pread 128K는 6스레드 +9%, 12스레드 -6%.
        pread 512K는 -9%, -21%. 비동기 로더는 6스레드 +7%, 12스레드 -7~+2%. GPU expert 캐시는 12스레드에서 -43~-48%.
      </desc>
      {mark(6, 30, 34)}
      <text x="48" y="41" fill={muted} fontSize="20">6스레드</text>
      {mark(12, 170, 34)}
      <text x="188" y="41" fill={muted} fontSize="20">12스레드</text>
      <text x="320" y="41" fill={muted} fontSize="20">막대: ±표준편차</text>

      {[-60, -40, -20, 0, 20, 40].map((v) => (
        <g key={v}>
          <line x1={px(v)} x2={px(v)} y1={TOP - 26} y2={bottom} stroke={v === 0 ? axis : grid} strokeWidth={v === 0 ? 2 : 1} strokeDasharray={v === 0 ? '6 5' : undefined} />
          <text x={px(v)} y={bottom + 30} textAnchor="middle" fill={muted} fontSize="20">{v > 0 ? `+${v}` : v}</text>
        </g>
      ))}
      <text x={X0 + W / 2} y={bottom + 64} textAnchor="middle" fill={muted} fontSize="20">기준값 대비 decode 변화 (%)</text>

      {ROWS.map((r, i) => {
        const y = TOP + i * ROW_H;
        return (
          <g key={r.label}>
            <text x="20" y={y + 7} fill={text} fontSize="20">{r.label}</text>
            {r.pts.map((p) => {
              const dy = r.pts.length > 1 ? (p.t === 6 ? -9 : 9) : 0;
              return (
                <g key={p.t}>
                  <line x1={px(p.v - p.e)} x2={px(p.v + p.e)} y1={y + dy} y2={y + dy} stroke={C[p.t]} strokeWidth="2.5" />
                  {mark(p.t, px(p.v), y + dy)}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
