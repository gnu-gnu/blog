// 35B-A3B 서버 요청 8회: decode 구간 NVMe 처리량과 decode 속도. 같은 프롬프트의 두 회차를 점선으로 잇는다.
const PTS = [
  [131, 0.94], [207, 1.13], [294, 1.57], [482, 1.96],
  [279, 1.84], [466, 2.38], [487, 2.43], [409, 1.64],
];
const X0 = 100;
const W = 600;
const Y0 = 420;
const H = 340;
const px = (v) => X0 + (v / 600) * W;
const py = (v) => Y0 - (v / 3) * H;

export default function DecodeVsNvme() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  const axis = 'var(--cds-chart-axis)';
  const c = 'var(--cds-chart-categorical-4)';
  return (
    <svg viewBox="0 0 760 520" role="img" aria-labelledby="dvn-title dvn-desc">
      <title id="dvn-title">decode 속도와 NVMe 처리량</title>
      <desc id="dvn-desc">
        요청 8회의 decode 구간 NVMe 처리량(131~487 MB/s)과 decode 속도(0.94~2.43 tok/s). 상관계수 0.90.
        같은 프롬프트가 207 MB/s에서 1.13 tok/s, 466 MB/s에서 2.38 tok/s였다.
      </desc>
      <text x="20" y="40" fill={muted} fontSize="20">decode tok/s</text>
      {[0, 1, 2, 3].map((v) => (
        <g key={v}>
          <line x1={X0} x2={X0 + W} y1={py(v)} y2={py(v)} stroke={grid} strokeWidth="1" />
          <text x={X0 - 14} y={py(v) + 7} textAnchor="end" fill={muted} fontSize="20">{v}</text>
        </g>
      ))}
      {[0, 200, 400, 600].map((v) => (
        <text key={v} x={px(v)} y={Y0 + 34} textAnchor="middle" fill={muted} fontSize="20">{v}</text>
      ))}
      <line x1={X0} x2={X0 + W} y1={Y0} y2={Y0} stroke={axis} strokeWidth="2" />
      <text x={X0 + W / 2} y="500" textAnchor="middle" fill={muted} fontSize="20">decode 구간 NVMe 처리량 (MB/s)</text>

      <line x1={px(207)} y1={py(1.13)} x2={px(466)} y2={py(2.38)} stroke={muted} strokeWidth="2" strokeDasharray="6 5" />
      {PTS.map(([x, y], i) => (
        <circle key={i} cx={px(x)} cy={py(y)} r="8" fill={c} stroke="var(--surface)" strokeWidth="2" />
      ))}
      <text x={px(207) + 16} y={py(1.13) + 30} fill={text} fontSize="20">1.13</text>
      <text x={px(466) - 16} y={py(2.38) - 16} textAnchor="end" fill={text} fontSize="20">같은 프롬프트 2.38</text>
      <text x={px(600)} y={py(0.5)} textAnchor="end" fill={text} fontSize="22" fontWeight="600">r = 0.90 (n = 8)</text>
    </svg>
  );
}
