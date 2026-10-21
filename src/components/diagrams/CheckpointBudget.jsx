// 체크포인트 크기: 전부 NVFP4였다면 / 실제 받은 체크포인트 / PLE FP8 변환 후. 세 막대는 같은 축척(165.4 GiB = 700px).
const X0 = 30;
const W = 700;
const MAX = 165.4;
const px = (gib) => (gib / MAX) * W;

const ROWS = [
  {
    title: '예상 — 전부 NVFP4였다면',
    total: '91.1 GiB',
    note: '노드 한 대에도 들어가는 크기',
    segs: [{ v: 91.1, color: 'var(--cds-chart-categorical-1)', opacity: 0.4, label: '173.8 B × 4.5 bit' }],
  },
  {
    title: '실제 — 받은 체크포인트',
    total: '165.4 GiB',
    note: '초과 74.3 GiB 중 68.5 GiB가 PLE에서 나왔다',
    segs: [
      { v: 63.28, color: 'var(--cds-chart-categorical-1)', label: 'MoE 전문가 (NVFP4)' },
      { v: 95.37, color: 'var(--cds-chart-status-critical)', label: 'PLE (BF16)' },
      { v: 165.4 - 63.28 - 95.37, color: 'var(--cds-chart-axis)' },
    ],
  },
  {
    title: '변환 후 — 현재 운영 중',
    total: '118.3 GiB',
    note: 'PLE를 FP8로 바꾸고 128개 파일로 나눴다',
    segs: [
      { v: 63.28, color: 'var(--cds-chart-categorical-1)', label: 'MoE 전문가 (NVFP4)' },
      { v: 47.68, color: 'var(--cds-chart-categorical-3)', label: 'PLE (FP8)' },
      { v: 118.3 - 63.28 - 47.68, color: 'var(--cds-chart-axis)' },
    ],
  },
];

const ROW_H = 176;

export default function CheckpointBudget() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  return (
    <svg viewBox={`0 0 760 ${ROWS.length * ROW_H + 40}`} role="img" aria-labelledby="ckpt-budget-title ckpt-budget-desc">
      <title id="ckpt-budget-title">체크포인트 크기: 예상, 실제, 변환 후</title>
      <desc id="ckpt-budget-desc">
        전부 NVFP4였다면 91.1 GiB. 실제 체크포인트는 165.4 GiB로, MoE 전문가 NVFP4 63.28 GiB와 BF16 PLE 95.37 GiB가 대부분이다.
        PLE를 FP8로 바꾼 뒤 118.3 GiB. 세 막대는 같은 축척이다.
      </desc>
      {ROWS.map((r, i) => {
        const top = 20 + i * ROW_H;
        let x = X0;
        // 구간 사이 3px 틈은 앞 구간 폭에서 빼서 전체 길이가 축척을 넘지 않게 한다.
        const segs = r.segs.map((s, k) => {
          const last = k === r.segs.length - 1;
          const seg = { ...s, x, w: px(s.v) - (last ? 0 : 3) };
          x += px(s.v);
          return seg;
        });
        return (
          <g key={r.title}>
            <text x={X0} y={top + 24} fill={text} fontSize="23" fontWeight="600">{r.title}</text>
            <text x={X0 + W} y={top + 24} textAnchor="end" fill={text} fontSize="23" fontWeight="600">{r.total}</text>
            {segs.map((s, k) => (
              <rect key={k} x={s.x} y={top + 38} width={Math.max(s.w, 2)} height="44" rx="3" fill={s.color} opacity={s.opacity ?? 1} />
            ))}
            {segs.filter((s) => s.label).map((s, k) => (
              <text key={k} x={s.x + 2} y={top + 110} fill={muted} fontSize="20">{s.label}</text>
            ))}
            <text x={X0} y={top + 142} fill={muted} fontSize="20">{r.note}</text>
          </g>
        );
      })}
      <rect x={X0} y={ROWS.length * ROW_H + 6} width="18" height="18" rx="2" fill="var(--cds-chart-axis)" />
      <text x={X0 + 28} y={ROWS.length * ROW_H + 22} fill={muted} fontSize="20">어텐션 · lm_head · vision</text>
    </svg>
  );
}
