// 35B-A3B를 --cpu-moe + mmap으로 돌릴 때 토큰 하나가 레이어 하나를 지나는 경로.
export default function MoeExpertPath() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const axis = 'var(--cds-chart-axis)';
  const gpu = 'var(--cds-chart-categorical-1)';
  const cpu = 'var(--cds-chart-categorical-2)';
  const disk = 'var(--cds-chart-categorical-4)';
  const box = (x, y, w, h, stroke, dash) => (
    <rect x={x} y={y} width={w} height={h} rx="10" fill="var(--surface)" stroke={stroke} strokeWidth="2.5" strokeDasharray={dash} />
  );
  const arrow = (x1, y1, x2, y2) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={muted} strokeWidth="2.5" markerEnd="url(#mep-arrow)" />
  );
  return (
    <svg viewBox="0 0 760 700" role="img" aria-labelledby="mep-title mep-desc">
      <title id="mep-title">MoE 레이어 하나에서 expert 가중치를 읽는 경로</title>
      <desc id="mep-desc">
        attention과 shared expert는 GPU에서 계산한다. router가 routed expert 256개 중 8개를 고르면 CPU 계산 스레드가 up, gate, down 순서로 계산한다.
        expert 가중치는 mmap된 파일이라 page cache에 있으면 바로 읽고, 없으면 major fault로 NVMe에서 읽는다.
        토큰당 expert 바이트 594 MB 중 146~279 MB가 NVMe에서 왔다.
      </desc>
      <defs>
        <marker id="mep-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={muted} />
        </marker>
      </defs>
      <text x="20" y="34" fill={muted} fontSize="20">토큰 1개 · 레이어 1개 (40회 반복)</text>

      {box(20, 52, 720, 70, gpu)}
      <text x="44" y="96" fill={text} fontSize="22" fontWeight="600">GPU</text>
      <text x="120" y="96" fill={text} fontSize="21">attention · shared expert · router</text>
      {arrow(380, 122, 380, 160)}

      {box(20, 164, 720, 104, cpu)}
      <text x="44" y="206" fill={text} fontSize="22" fontWeight="600">CPU</text>
      <text x="120" y="206" fill={text} fontSize="21">고른 expert 8개(256개 중)를 계산</text>
      <text x="120" y="244" fill={muted} fontSize="20">up → gate → down, 연산마다 스레드 barrier</text>
      {arrow(380, 268, 380, 306)}

      {box(20, 310, 720, 70, axis)}
      <text x="44" y="354" fill={text} fontSize="21">mmap된 expert 가중치 페이지에 접근</text>
      {arrow(200, 380, 200, 424)}
      {arrow(560, 380, 560, 424)}

      {box(20, 428, 350, 110, axis)}
      <text x="44" y="470" fill={text} fontSize="21" fontWeight="600">page cache에 있음</text>
      <text x="44" y="508" fill={muted} fontSize="20">DRAM에서 바로 읽는다</text>

      {box(390, 428, 350, 110, disk, '8 6')}
      <text x="414" y="470" fill={text} fontSize="21" fontWeight="600">없음 → major fault</text>
      <text x="414" y="508" fill={muted} fontSize="20">NVMe에서 70~84 KiB씩</text>

      <rect x="20" y="572" width="720" height="104" rx="10" fill="var(--cds-chart-reference-tint)" />
      <text x="44" y="612" fill={text} fontSize="21">expert 바이트: 토큰당 594 MB (17.71 GiB × 8/256)</text>
      <text x="44" y="650" fill={text} fontSize="21">그중 NVMe에서 146~279 MB (25~47%)</text>
    </svg>
  );
}
