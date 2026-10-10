export const SITE = {
  title: 'gnu.or.kr',
  description: '심근우(Gnu Shim)의 기술 블로그. 클라우드, 데이터 파이프라인, 통신과 AI 인프라에 대해 씁니다.',
  author: '심근우 (Gnu Shim)',
  github: 'https://github.com/gnu-gnu',
  linkedin: 'https://www.linkedin.com/in/gnu-shim/',
  lang: 'ko',
};

/**
 * 카테고리는 글마다 하나. 글 frontmatter의 `category`에는 아래 name을 그대로 씁니다.
 * 목록을 바꾸면 순서대로 화면에 나옵니다. 글이 없는 카테고리는 화면에 나오지 않습니다.
 */
export const CATEGORIES = [
  { name: 'DevOps·SRE', slug: 'devops-sre', description: '배포 파이프라인, 인프라 코드, 관측, 운영 자동화' },
  { name: '데이터 파이프라인', slug: 'data-pipeline', description: '수집, 스트림 처리, 이상 탐지' },
  { name: '통신 BSS', slug: 'telco-bss', description: '가입·청구·수납을 지탱하는 통신사 코어 시스템' },
  { name: 'AI 인프라', slug: 'ai-infra', description: '모델 서빙, GPU, 추론 엔진' },
  { name: '차세대 네트워크', slug: 'next-gen-network', description: '6G, AI-RAN, 비지상 네트워크' },
  { name: 'AX', slug: 'ax', description: '업무에 AI를 붙이는 프로젝트와 에이전트' },
  { name: '팀과 일하는 법', slug: 'team', description: '리더십, 조직, 협업' },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]['name'];
export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name) as unknown as [CategoryName, ...CategoryName[]];

export function categoryOf(name: string | undefined) {
  return CATEGORIES.find((c) => c.name === name);
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' });
}
