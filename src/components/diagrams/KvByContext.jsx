// 컨텍스트별 KV 메모리(f16, 단일 시퀀스). full attention KV + 고정 크기(SWA 또는 recurrent state). llama.cpp 로드 로그 값.
const MODELS = [
  { name: 'Gemma 4 E2B', color: 'var(--cds-chart-categorical-1)', v: [0.035, 0.199, 0.762] },
  { name: 'Gemma 4 E4B', color: 'var(--cds-chart-categorical-3)', v: [0.102, 0.539, 2.039] },
  { name: 'Qwen3.5-9B', color: 'var(--cds-chart-categorical-2)', v: [0.174, 1.049, 4.049] },
];
const CTX = ['4K', '32K', '128K'];
const CX = [230, 440, 650];
const BW = 52;
const Y0 = 420;
const H = 300;
const MAX = 4.5;
const py = (v) => Y0 - (v / MAX) * H;

export default function KvByContext() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const grid = 'var(--cds-chart-grid)';
  const axis = 'var(--cds-chart-axis)';
  return (
    <svg viewBox="0 0 760 500" role="img" aria-labelledby="kvc-title kvc-desc">
      <title id="kvc-title">컨텍스트 길이별 KV 메모리</title>
      <desc id="kvc-desc">
        4K, 32K, 128K에서 KV 메모리. Gemma 4 E2B 0.03, 0.20, 0.76 GiB. E4B 0.10, 0.54, 2.04 GiB.
        Qwen3.5-9B 0.17, 1.05 GiB이고 128K는 4 GiB KV 할당에 실패했다.
      </desc>
      {MODELS.map((m, i) => (
        <g key={m.name}>
          <rect x={20 + i * 240} y="22" width="22" height="22" rx="4" fill={m.color} />
          <text x={52 + i * 240} y="41" fill={muted} fontSize="20">{m.name}</text>
        </g>
      ))}
      <text x="20" y="92" fill={muted} fontSize="20">GiB</text>
      {[0, 1, 2, 3, 4].map((v) => (
        <g key={v}>
          <line x1="80" x2="740" y1={py(v)} y2={py(v)} stroke={grid} strokeWidth="1" />
          <text x="68" y={py(v) + 7} textAnchor="end" fill={muted} fontSize="20">{v}</text>
        </g>
      ))}
      <line x1="80" x2="740" y1={Y0} y2={Y0} stroke={axis} strokeWidth="2" />

      {CTX.map((c, ci) => (
        <g key={c}>
          {MODELS.map((m, mi) => {
            const x = CX[ci] + (mi - 1) * (BW + 4) - BW / 2;
            const v = m.v[ci];
            const failed = ci === 2 && mi === 2;
            return (
              <g key={m.name}>
                {failed ? (
                  <rect x={x} y={py(v)} width={BW} height={Y0 - py(v)} rx="4" fill="none" stroke={m.color} strokeWidth="2.5" strokeDasharray="7 5" />
                ) : (
                  <rect x={x} y={py(v)} width={BW} height={Math.max(Y0 - py(v), 2)} rx="4" fill={m.color} />
                )}
                {ci > 0 && (
                  <text x={x + BW / 2} y={py(v) - 10} textAnchor="middle" fill={text} fontSize="20">{v.toFixed(v >= 1 ? 1 : 2)}</text>
                )}
              </g>
            );
          })}
          <text x={CX[ci]} y={Y0 + 34} textAnchor="middle" fill={text} fontSize="22">{c}</text>
        </g>
      ))}
      <text x="650" y={py(4.049) - 40} textAnchor="middle" fill={text} fontSize="20" fontWeight="600">할당 실패</text>
      <text x="410" y="490" textAnchor="middle" fill={muted} fontSize="20">컨텍스트 길이 (f16 KV, 단일 시퀀스)</text>
    </svg>
  );
}
