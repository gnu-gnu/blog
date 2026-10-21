// 추측 디코딩을 켰을 때와 껐을 때의 시스템 처리량 비율. 같은 모델·KV dtype·NVLink 켬 조건끼리 나눈 값.
const XS = { 1: 120, 8: 255, 16: 390, 32: 525 };
const y = (v) => 70 + (2.2 - v) * 200;

const SERIES = [
  { name: 'Gemma 4 31B', color: 'var(--cds-chart-categorical-2)', values: [2.154, 1.345, 1.181, 1.185], first: '2.15×', last: '1.19×', firstDy: -8 },
  { name: 'Muse Glimmer 30B', color: 'var(--cds-chart-categorical-3)', values: [1.752, 0.686, 0.512, 0.441], first: '1.75×', last: '0.44×', firstDy: -10 },
  { name: 'EXAONE 4.5 33B', color: 'var(--cds-chart-categorical-1)', values: [0.897, 0.861, 0.798, 0.784], first: '0.90×', last: '0.78×', firstDy: 34 },
];
const SHORT = { 'Gemma 4 31B': 'Gemma', 'Muse Glimmer 30B': 'Muse', 'EXAONE 4.5 33B': 'EXAONE' };
const CONC = [1, 8, 16, 32];

export default function SpecDecodeGain() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  const axis = 'var(--cds-chart-axis)';
  return (
    <svg viewBox="0 0 760 520" role="img" aria-labelledby="spec-gain-title spec-gain-desc">
      <title id="spec-gain-title">추측 디코딩을 켰을 때의 처리량 비율</title>
      <desc id="spec-gain-desc">
        동시 요청 1, 8, 16, 32에서 추측 디코딩 켬 대 끔의 시스템 처리량 비율. Gemma는 2.15, 1.35, 1.18, 1.19배.
        Muse Glimmer는 1.75, 0.69, 0.51, 0.44배. EXAONE은 0.90, 0.86, 0.80, 0.78배.
      </desc>
      <text x="20" y="34" fill={muted} fontSize="22">처리량 비율 (켬 ÷ 끔)</text>

      {[0.5, 1.5, 2.0].map((v) => (
        <g key={v}>
          <line x1="110" x2="540" y1={y(v)} y2={y(v)} stroke={grid} strokeWidth="1" />
          <text x="98" y={y(v) + 8} textAnchor="end" fill={muted} fontSize="22">{v.toFixed(1)}×</text>
        </g>
      ))}
      <line x1="110" x2="540" y1={y(1)} y2={y(1)} stroke={axis} strokeWidth="2" strokeDasharray="6 5" />
      <text x="98" y={y(1) + 8} textAnchor="end" fill={text} fontSize="22" fontWeight="600">1.0×</text>
      <text x="540" y={y(1) - 10} textAnchor="end" fill={muted} fontSize="20">이 선 아래면 손해</text>

      {CONC.map((c) => (
        <text key={c} x={XS[c]} y="466" textAnchor="middle" fill={muted} fontSize="22">{c}</text>
      ))}
      <text x="322" y="504" textAnchor="middle" fill={muted} fontSize="22">동시 요청 수</text>

      {SERIES.map((s) => {
        const pts = s.values.map((v, i) => [XS[CONC[i]], y(v)]);
        return (
          <g key={s.name}>
            <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={s.color} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r="6.5" fill={s.color} stroke="var(--surface)" strokeWidth="2" />
            ))}
            <text x={pts[0][0] + 16} y={pts[0][1] + s.firstDy} fill={s.color} fontSize="22" fontWeight="600">{s.first}</text>
            <text x="548" y={pts[3][1] + 8} fill={s.color} fontSize="22" fontWeight="600">{SHORT[s.name]} {s.last}</text>
          </g>
        );
      })}
    </svg>
  );
}
