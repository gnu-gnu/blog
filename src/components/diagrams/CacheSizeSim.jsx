// 라우터 trace(요청 12개) 시뮬레이션: 캐시 크기별 decode 토큰당 NVMe 읽기. LRU vs 학습 요청 빈도로 고정한 배치.
const SIM = [
  [0.5, 567, 480], [1, 274, 441], [1.5, 221, 408], [2, 186, 376],
  [3, 139, 323], [4, 106, 279], [6, 61, 212], [8, 36, 157],
];
const NO_CACHE = 567;
const X0 = 110;
const W = 600;
const Y0 = 440;
const H = 360;
const px = (v) => X0 + (v / 8) * W;
const py = (v) => Y0 - (v / 600) * H;

export default function CacheSizeSim() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  const axis = 'var(--cds-chart-axis)';
  const lru = 'var(--cds-chart-categorical-1)';
  const pin = 'var(--cds-chart-categorical-2)';
  const path = (k) => SIM.map((r, i) => `${i ? 'L' : 'M'}${px(r[0])},${py(r[k])}`).join(' ');
  return (
    <svg viewBox="0 0 760 540" role="img" aria-labelledby="css-title css-desc">
      <title id="css-title">캐시 크기별 decode 토큰당 NVMe 읽기 (시뮬레이션)</title>
      <desc id="css-desc">
        캐시가 없으면 토큰당 567 MiB를 읽는다. LRU는 0.5 GiB에서 567 MiB(효과 없음), 1 GiB 274, 2 GiB 186, 4 GiB 106, 8 GiB 36 MiB.
        학습 요청 6개의 빈도로 expert를 고정 배치하면 같은 크기에서 480, 441, 376, 279, 157 MiB로 LRU보다 많이 읽는다.
      </desc>
      <line x1="24" x2="56" y1="34" y2="34" stroke={lru} strokeWidth="3" />
      <circle cx="40" cy="34" r="7" fill={lru} stroke="var(--surface)" strokeWidth="2" />
      <text x="66" y="41" fill={muted} fontSize="20">LRU</text>
      <line x1="140" x2="172" y1="34" y2="34" stroke={pin} strokeWidth="3" />
      <rect x="149" y="27" width="14" height="14" rx="2" fill={pin} stroke="var(--surface)" strokeWidth="2" />
      <text x="182" y="41" fill={muted} fontSize="20">자주 쓰인 expert 고정</text>

      {[0, 200, 400, 600].map((v) => (
        <g key={v}>
          <line x1={X0} x2={X0 + W} y1={py(v)} y2={py(v)} stroke={grid} strokeWidth="1" />
          <text x={X0 - 14} y={py(v) + 7} textAnchor="end" fill={muted} fontSize="20">{v}</text>
        </g>
      ))}
      {[0, 2, 4, 6, 8].map((v) => (
        <text key={v} x={px(v)} y={Y0 + 34} textAnchor="middle" fill={muted} fontSize="20">{v}</text>
      ))}
      <line x1={X0} x2={X0 + W} y1={Y0} y2={Y0} stroke={axis} strokeWidth="2" />
      <text x={X0 + W / 2} y="520" textAnchor="middle" fill={muted} fontSize="20">캐시 크기 (GiB)</text>
      <text x="20" y={py(600) - 16} fill={muted} fontSize="20">MiB/토큰</text>

      <line x1={X0} x2={X0 + W} y1={py(NO_CACHE)} y2={py(NO_CACHE)} stroke={axis} strokeWidth="2" strokeDasharray="7 6" />
      <text x={X0 + W} y={py(NO_CACHE) - 12} textAnchor="end" fill={text} fontSize="20">캐시 없음 567</text>
      <line x1={px(2)} x2={px(2)} y1={py(600)} y2={Y0} stroke={axis} strokeWidth="1.5" strokeDasharray="3 5" />
      <text x={px(2) + 10} y={Y0 - 14} fill={muted} fontSize="20">사용한 2 GiB</text>

      <path d={path(2)} fill="none" stroke={pin} strokeWidth="2.5" />
      <path d={path(1)} fill="none" stroke={lru} strokeWidth="2.5" />
      {SIM.map((r) => (
        <g key={r[0]}>
          <rect x={px(r[0]) - 7} y={py(r[2]) - 7} width="14" height="14" rx="2" fill={pin} stroke="var(--surface)" strokeWidth="2" />
          <circle cx={px(r[0])} cy={py(r[1])} r="7" fill={lru} stroke="var(--surface)" strokeWidth="2" />
        </g>
      ))}
      <text x={px(2) + 14} y={py(376) - 14} fill={text} fontSize="20">376</text>
      <text x={px(2) + 14} y={py(186) + 30} fill={text} fontSize="20" fontWeight="600">186</text>
    </svg>
  );
}
