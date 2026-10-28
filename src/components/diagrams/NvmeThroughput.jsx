// decode 중 NVMe 처리량(llama-server 5회 평균, 같은 세션의 -t 6/-t 12)과 같은 파일에 대한 fio 읽기 처리량.
const X0 = 290;
const W = 380;
const MAX = 2800;
const px = (v) => (v / MAX) * W;

const GROUPS = [
  {
    title: 'decode 중 실측 (35B-A3B)',
    color: 'var(--cds-chart-categorical-4)',
    rows: [
      { label: '-t 6 · 동시 I/O 1.28', v: 451 },
      { label: '-t 12 · 동시 I/O 1.67', v: 583 },
    ],
  },
  {
    title: 'fio, 같은 모델 파일',
    color: 'var(--cds-chart-axis)',
    rows: [
      { label: '64 KiB 랜덤 · QD1', v: 200 },
      { label: '64 KiB 랜덤 · QD2', v: 465 },
      { label: '64 KiB 랜덤 · QD4', v: 778 },
      { label: '128 KiB 랜덤 · QD8', v: 1618 },
      { label: '1 MiB 순차', v: 2515 },
    ],
  },
];

export default function NvmeThroughput() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  let y = 20;
  const items = [];
  GROUPS.forEach((g) => {
    items.push({ kind: 'title', y: y + 28, g });
    y += 48;
    g.rows.forEach((r) => {
      items.push({ kind: 'row', y, r, g });
      y += 50;
    });
    y += 18;
  });
  const bottom = y;
  return (
    <svg viewBox={`0 0 760 ${bottom + 50}`} role="img" aria-labelledby="nqt-title nqt-desc">
      <title id="nqt-title">decode 중 NVMe 처리량과 장치 처리량</title>
      <desc id="nqt-desc">
        decode 중 NVMe 처리량은 6스레드 451 MB/s(동시 I/O 1.28), 12스레드 583 MB/s(1.67).
        같은 파일을 fio로 읽으면 64 KiB QD1 200, QD2 465, QD4 778, 128 KiB QD8 1,618, 1 MiB 순차 2,515 MB/s.
      </desc>
      {[0, 1000, 2000].map((v) => (
        <g key={v}>
          <line x1={X0 + px(v)} x2={X0 + px(v)} y1="20" y2={bottom} stroke={grid} strokeWidth="1" />
          <text x={X0 + px(v)} y={bottom + 30} textAnchor="middle" fill={muted} fontSize="20">{v.toLocaleString()}</text>
        </g>
      ))}
      <text x="740" y={bottom + 30} textAnchor="end" fill={muted} fontSize="20">MB/s</text>
      {items.map((it, i) =>
        it.kind === 'title' ? (
          <text key={i} x="20" y={it.y} fill={text} fontSize="22" fontWeight="600">{it.g.title}</text>
        ) : (
          <g key={i}>
            <text x="20" y={it.y + 28} fill={muted} fontSize="20">{it.r.label}</text>
            <rect x={X0} y={it.y + 6} width={px(it.r.v)} height="32" rx="4" fill={it.g.color} />
            <text x={X0 + px(it.r.v) + 10} y={it.y + 30} fill={text} fontSize="20">{it.r.v.toLocaleString()}</text>
          </g>
        )
      )}
    </svg>
  );
}
