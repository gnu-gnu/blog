// 사용자 공간 expert 캐시: mul_mat_id 호출 하나에서 조회, O_DIRECT 읽기, 계산이 겹치는 방식.
export default function ExpertCachePipeline() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const axis = 'var(--cds-chart-axis)';
  const cpu = 'var(--cds-chart-categorical-2)';
  const io = 'var(--cds-chart-categorical-4)';
  const hit = 'var(--cds-chart-categorical-1)';
  const box = (x, y, w, h, stroke, dash) => (
    <rect x={x} y={y} width={w} height={h} rx="10" fill="var(--surface)" stroke={stroke} strokeWidth="2.5" strokeDasharray={dash} />
  );
  const arrow = (x1, y1, x2, y2) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={muted} strokeWidth="2.5" markerEnd="url(#ecp-arrow)" />
  );
  return (
    <svg viewBox="0 0 760 760" role="img" aria-labelledby="ecp-title ecp-desc">
      <title id="ecp-title">expert 캐시가 읽기와 계산을 겹치는 방식</title>
      <desc id="ecp-desc">
        router가 고른 expert 8개를 캐시에서 찾는다. 캐시 단위는 레이어 하나의 expert 하나(up, gate, down)이고 2 GiB에 1,150개가 들어간다.
        있는 expert는 바로 계산하고, 없는 expert는 LRU로 슬롯을 비운 뒤 128 KiB 조각으로 나눠 I/O 스레드 4개에 넘긴다.
        I/O 스레드는 O_DIRECT pread로 읽으며 지금 계산할 종류(gate)를 먼저 읽는다. 계산 스레드는 있는 expert를 먼저 계산하고,
        늦은 expert는 자기 몫의 조각이 도착하면 계산한다.
      </desc>
      <defs>
        <marker id="ecp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={muted} />
        </marker>
      </defs>
      <text x="20" y="34" fill={muted} fontSize="20">레이어 하나의 expert 연산 (gate → up → down)</text>

      {box(20, 52, 720, 104, axis)}
      <text x="44" y="94" fill={text} fontSize="22" fontWeight="600">조회 (계산 스레드 0)</text>
      <text x="44" y="132" fill={muted} fontSize="20">고른 expert 8개를 (레이어, expert) 단위로 찾는다</text>
      {arrow(200, 156, 200, 196)}
      {arrow(560, 156, 560, 196)}

      {box(20, 200, 350, 140, hit)}
      <text x="44" y="242" fill={text} fontSize="21" fontWeight="600">캐시에 있음</text>
      <text x="44" y="280" fill={muted} fontSize="20">바로 계산 대상</text>
      <text x="44" y="314" fill={muted} fontSize="20">LRU 시각만 갱신</text>

      {box(390, 200, 350, 140, io, '8 6')}
      <text x="414" y="242" fill={text} fontSize="21" fontWeight="600">없음</text>
      <text x="414" y="280" fill={muted} fontSize="20">가장 오래된 슬롯을 비우고</text>
      <text x="414" y="314" fill={muted} fontSize="20">128 KiB 조각을 큐에 넣음</text>
      {arrow(565, 340, 565, 380)}

      {box(390, 384, 350, 140, io)}
      <text x="414" y="426" fill={text} fontSize="21" fontWeight="600">I/O 스레드 4개</text>
      <text x="414" y="464" fill={muted} fontSize="20">O_DIRECT pread</text>
      <text x="414" y="498" fill={muted} fontSize="20">지금 계산할 종류 먼저</text>
      {arrow(195, 340, 195, 560)}
      {arrow(565, 524, 565, 560)}

      {box(20, 564, 720, 104, cpu)}
      <text x="44" y="606" fill={text} fontSize="22" fontWeight="600">계산 스레드 (-t 4)</text>
      <text x="44" y="644" fill={muted} fontSize="20">있는 expert 먼저 → 늦은 expert는 자기 몫 조각이 오면</text>

      <rect x="20" y="690" width="720" height="56" rx="10" fill="var(--cds-chart-reference-tint)" />
      <text x="44" y="726" fill={text} fontSize="20">단위 1.75~2.20 MiB · 2 GiB = 1,150개 (전체 10,240개의 11%)</text>
    </svg>
  );
}
