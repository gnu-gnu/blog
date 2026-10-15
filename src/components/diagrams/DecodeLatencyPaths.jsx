export default function DecodeLatencyPaths() {
  const text = 'var(--cds-text-primary)';
  const muted = 'var(--cds-text-secondary)';
  const line = 'var(--cds-chart-axis)';
  return (
    <svg viewBox="0 0 760 470" role="img" aria-labelledby="decode-latency-paths-title decode-latency-paths-desc">
      <title id="decode-latency-paths-title">전체 지연을 CPU 실행 시간과 비실행 시간으로 나눠 보기</title>
      <desc id="decode-latency-paths-desc">CPU 실행 시간이 늘어난 사례와 CPU 비실행 시간이 늘어난 사례를 구분한다. 두 양상의 정확한 원인은 아직 확정되지 않았다.</desc>
      <text x="380" y="46" textAnchor="middle" fill={text} fontSize="28" fontWeight="600">같은 decode가 가끔 느려진다</text>
      <path d="M380 65 V93" fill="none" stroke={line} strokeWidth="2" />
      <rect x="30" y="100" width="700" height="145" rx="12" fill="var(--cds-chart-reference-tint)" stroke={line} />
      <text x="55" y="140" fill="var(--cds-chart-categorical-1)" fontSize="27" fontWeight="600">① CPU 실행 시간도 증가</text>
      <text x="55" y="182" fill={text} fontSize="25">CPU가 실행 중인 구간이 길어졌다</text>
      <text x="55" y="219" fill={muted} fontSize="23">작업 비용·실행 속도를 확인할 단서</text>
      <rect x="30" y="265" width="700" height="145" rx="12" fill="var(--cds-chart-reference-tint)" stroke={line} />
      <text x="55" y="305" fill="var(--cds-chart-categorical-2)" fontSize="27" fontWeight="600">② CPU 비실행 시간이 증가</text>
      <text x="55" y="347" fill={text} fontSize="25">경과 시간과 CPU 시간의 차이가 커졌다</text>
      <text x="55" y="384" fill={muted} fontSize="23">스케줄링·대기 상태를 확인할 단서</text>
      <text x="380" y="450" textAnchor="middle" fill={muted} fontSize="23">관측 양상을 분리한 것이며, 원인 확정은 아니다</text>
    </svg>
  );
}
