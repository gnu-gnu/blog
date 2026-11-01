// h·hᴴ 대각 허수부가 곱셈 순서에 따라 남거나 사라지는 양상. 칩의 값은 실측, 왼쪽 계산 순서는 그 패턴을 재현한 모델이다.
const rows = [
  { t: '곱 둘을 각각 반올림한 뒤 뺌', d: '같은 곱이 같게 반올림돼 정확히 상쇄', k: 'TF CPU, numpy einsum', v: ['0', '0', '0'] },
  { t: '한쪽 곱만 FMA로 정확히 계산', d: '곱의 반올림 오차가 그대로 남음', k: 'numpy BLAS 경로', v: ['남음', '0', '남음'] },
  { t: '한 누산기에 더하고 빼기', d: '누산 중 반올림이 남음', k: 'cuBLAS GEMM, TF GPU', v: ['남음', '일부', '남음'] },
  { t: '대각을 실수로 계산', d: '허수부를 계산하지 않음', k: 'cuBLAS HERK', v: ['-', '0', '-'] },
];
const cols = [540, 625, 710];
const head = ['c64', '캐스트', 'c128'];
const chip = (v) => (v === '남음' ? 'var(--cds-chart-status-critical)' : v === '일부' ? 'var(--cds-chart-categorical-2)' : 'none');
export default function KernelResidualOrder() {
  return (
    <svg viewBox="0 0 760 640" width="100%" role="img" aria-label="곱셈 순서별 대각 허수부 잔여물">
      <text x="16" y="34" fontSize="24" fontWeight="700" fill="var(--cds-text-primary)">대각 허수부 = Σ (aᵢ·aᵣ − aᵣ·aᵢ)</text>
      <text x="16" y="66" fontSize="20" fill="var(--cds-text-secondary)">수식으로는 항마다 0인데, 구현에 따라 남기도 하고 0이기도 합니다.</text>
      <text x="16" y="116" fontSize="20" fontWeight="600" fill="var(--cds-text-primary)">계산 순서 (재현 모델)</text>
      <text x="625" y="88" fontSize="20" textAnchor="middle" fill="var(--cds-text-secondary)">실측 잔여물</text>
      {cols.map((x, i) => (
        <text key={head[i]} x={x} y="116" fontSize="20" textAnchor="middle" fontWeight="600" fill="var(--cds-text-primary)">{head[i]}</text>
      ))}
      {rows.map((r, n) => {
        const y = 126 + n * 106;
        return (
          <g key={r.t}>
            <line x1="16" x2="744" y1={y} y2={y} stroke="var(--cds-chart-grid)" strokeWidth="1" />
            <text x="16" y={y + 32} fontSize="21" fontWeight="600" fill="var(--cds-text-primary)">{r.t}</text>
            <text x="16" y={y + 62} fontSize="20" fill="var(--cds-text-secondary)">{r.d}</text>
            <text x="16" y={y + 90} fontSize="20" fill="var(--cds-chart-categorical-1)">{r.k}</text>
            {r.v.map((v, i) => (
              <g key={i}>
                <rect x={cols[i] - 36} y={y + 32} width="72" height="42" rx="6" fill={chip(v)} fillOpacity={chip(v) === 'none' ? 0 : 0.22} stroke="var(--cds-chart-axis)" strokeWidth="1" />
                <text x={cols[i]} y={y + 60} fontSize="20" textAnchor="middle" fontWeight={v === '0' || v === '-' ? '400' : '700'} fill="var(--cds-text-primary)">{v}</text>
              </g>
            ))}
          </g>
        );
      })}
      <line x1="16" x2="744" y1="550" y2="550" stroke="var(--cds-chart-grid)" strokeWidth="1" />
      <text x="16" y="582" fontSize="20" fill="var(--cds-text-secondary)">캐스트가 2행에서 0인 이유: 24비트 값 둘의 곱은 double에</text>
      <text x="16" y="612" fontSize="20" fill="var(--cds-text-secondary)">정확히 담겨 곱의 반올림 오차가 생기지 않습니다.</text>
    </svg>
  );
}
