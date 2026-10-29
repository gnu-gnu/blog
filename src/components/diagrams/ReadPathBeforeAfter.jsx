// expert 가중치 읽기 경로 비교: page cache(mmap) 경로와 사용자 공간 expert 캐시 경로.
export default function ReadPathBeforeAfter() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const before = 'var(--cds-chart-categorical-3)';
  const after = 'var(--cds-chart-categorical-1)';
  const box = (x, y, stroke, t1, t2) => (
    <g>
      <rect x={x} y={y} width="350" height="104" rx="10" fill="var(--surface)" stroke={stroke} strokeWidth="2.5" />
      <text x={x + 20} y={y + 42} fill={text} fontSize="21" fontWeight="600">{t1}</text>
      <text x={x + 20} y={y + 80} fill={muted} fontSize="20">{t2}</text>
    </g>
  );
  const arrow = (x, y1, y2) => (
    <line x1={x} y1={y1} x2={x} y2={y2} stroke={muted} strokeWidth="2.5" markerEnd="url(#rpba-arrow)" />
  );
  const L = 20;
  const R = 390;
  return (
    <svg viewBox="0 0 760 640" role="img" aria-labelledby="rpba-title rpba-desc">
      <title id="rpba-title">expert 읽기 경로: page cache와 expert 캐시</title>
      <desc id="rpba-desc">
        기존 경로에서는 계산 스레드가 mmap된 expert 페이지에 접근하다 page fault가 나면 커널이 70~84 KiB씩 읽고,
        그동안 그 스레드가 멈추며 barrier 때문에 나머지 스레드도 기다린다. 동시 I/O는 1~1.7개였다.
        개선한 경로에서는 계산 스레드가 캐시를 조회하고, 없는 expert는 전용 I/O 스레드 4개가 128 KiB씩 O_DIRECT로 읽는다.
        계산 스레드는 있는 expert를 먼저 계산하고 도착한 조각부터 이어서 계산한다. 동시 I/O는 최대 4개다.
      </desc>
      <defs>
        <marker id="rpba-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={muted} />
        </marker>
      </defs>
      <text x={L} y="38" fill={text} fontSize="22" fontWeight="600">기존: page cache</text>
      <text x={R} y="38" fill={text} fontSize="22" fontWeight="600">개선: expert 캐시</text>

      {box(L, 60, before, '계산 스레드 12개', 'expert 페이지에 접근')}
      {arrow(L + 175, 164, 200)}
      {box(L, 204, before, 'page fault', '커널이 70~84 KiB씩 읽음')}
      {arrow(L + 175, 308, 344)}
      {box(L, 348, before, '읽는 동안 스레드 정지', 'barrier로 나머지도 대기')}

      {box(R, 60, after, '계산 스레드 4개', '캐시에서 expert 조회')}
      {arrow(R + 175, 164, 200)}
      {box(R, 204, after, '없으면 I/O 스레드 4개', '128 KiB씩 O_DIRECT 읽기')}
      {arrow(R + 175, 308, 344)}
      {box(R, 348, after, '있는 expert 먼저 계산', '도착한 조각부터 이어서')}

      <rect x={L} y="486" width="350" height="64" rx="10" fill="var(--cds-chart-reference-tint)" />
      <text x={L + 20} y="527" fill={text} fontSize="21">동시 I/O 1~1.7개</text>
      <rect x={R} y="486" width="350" height="64" rx="10" fill="var(--cds-chart-reference-tint)" />
      <text x={R + 20} y="527" fill={text} fontSize="21">동시 I/O 최대 4개</text>

      <text x={L} y="600" fill={muted} fontSize="20">읽는 단위와 시점: 커널이 정함</text>
      <text x={R} y="600" fill={muted} fontSize="20">읽는 단위와 시점: 캐시가 정함</text>
    </svg>
  );
}
