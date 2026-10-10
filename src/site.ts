export const SITE = {
  title: 'gnu.or.kr',
  description: '심근우(Gnu Shim)의 기술 블로그. 클라우드, 데이터 파이프라인, 통신과 AI 인프라에 대해 씁니다.',
  author: '심근우 (Gnu Shim)',
  github: 'https://github.com/gnu-gnu',
  lang: 'ko',
};

export function formatDate(date: Date) {
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' });
}
