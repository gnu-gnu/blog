// Jetson Orin Nano의 메모리 계층. CPU와 GPU가 LPDDR5 하나를 나눠 쓰고, 용량 경계는 DRAM과 NVMe 사이에만 있다.
const BUFFERS = [
  { color: 'var(--cds-chart-categorical-1)', name: 'CUDA0', note: 'GPU가 쓰는 가중치 · KV cache' },
  { color: 'var(--cds-chart-categorical-3)', name: 'CPU_Mapped', note: 'mmap한 가중치 · 회수 가능' },
  { color: 'var(--cds-chart-categorical-2)', name: 'CUDA_Host', note: 'pinned 메모리 · 회수 불가' },
  { color: 'var(--cds-chart-categorical-4)', name: 'page cache', note: 'NVMe에서 읽어 둔 expert 페이지' },
];

export default function JetsonMemoryTiers() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const axis = 'var(--cds-chart-axis)';
  return (
    <svg viewBox="0 0 760 610" role="img" aria-labelledby="mt-title mt-desc">
      <title id="mt-title">Jetson Orin Nano의 메모리 계층</title>
      <desc id="mt-desc">
        CPU와 GPU가 7.4 GiB LPDDR5를 공유한다. CUDA0, CPU_Mapped, CUDA_Host, page cache는 모두 같은 DRAM 안의 구역이다.
        GPU 읽기 대역폭은 81.4 GB/s로 측정됐다. DRAM 아래의 NVMe에는 20 GiB짜리 35B-A3B 파일이 있고, decode 중 NVMe 처리량은 0.13~0.71 GB/s였다.
      </desc>
      <defs>
        <marker id="mt-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={muted} />
        </marker>
      </defs>

      <rect x="20" y="20" width="720" height="360" rx="12" fill="none" stroke={axis} strokeWidth="2" />
      <text x="44" y="60" fill={text} fontSize="24" fontWeight="600">LPDDR5 7.4 GiB — CPU와 GPU가 공유</text>

      <rect x="44" y="84" width="320" height="56" rx="8" fill="var(--cds-chart-reference-tint)" />
      <text x="204" y="120" textAnchor="middle" fill={text} fontSize="22">GPU</text>
      <rect x="396" y="84" width="320" height="56" rx="8" fill="var(--cds-chart-reference-tint)" />
      <text x="556" y="120" textAnchor="middle" fill={text} fontSize="22">CPU 6코어</text>

      {BUFFERS.map((b, i) => {
        const y = 176 + i * 44;
        return (
          <g key={b.name}>
            <rect x="44" y={y - 20} width="22" height="22" rx="4" fill={b.color} />
            <text x="80" y={y} fill={text} fontSize="21" fontWeight="600">{b.name}</text>
            <text x="250" y={y} fill={muted} fontSize="21">{b.note}</text>
          </g>
        );
      })}
      <text x="716" y="362" textAnchor="end" fill={muted} fontSize="20">GPU 읽기 실측 81.4 GB/s</text>

      <line x1="200" y1="384" x2="200" y2="470" stroke={muted} strokeWidth="2.5" markerStart="url(#mt-arrow)" />
      <text x="224" y="414" fill={text} fontSize="21">page fault · readahead로 읽기</text>
      <text x="224" y="446" fill={muted} fontSize="20">decode 중 0.13~0.71 GB/s, 동시 I/O 1~2개</text>

      <rect x="20" y="476" width="720" height="84" rx="12" fill="none" stroke={axis} strokeWidth="2" strokeDasharray="8 6" />
      <text x="44" y="512" fill={text} fontSize="22" fontWeight="600">NVMe, PCIe Gen3 x4</text>
      <text x="44" y="544" fill={muted} fontSize="20">35B-A3B GGUF 20 GiB · 1 MiB 순차 읽기 2.5 GB/s</text>

      <text x="380" y="596" textAnchor="middle" fill={muted} fontSize="20">네 구역은 모두 같은 DRAM이다. 용량 경계는 DRAM과 NVMe 사이 하나다.</text>
    </svg>
  );
}
