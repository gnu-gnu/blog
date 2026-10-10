# blog

https://blog.modus.ai.kr 의 소스입니다. [Astro](https://astro.build) 정적 사이트이고, `main`에 push하면 GitHub Actions가 빌드해서 GitHub Pages로 배포합니다.

## 글 쓰기

`src/content/posts/` 아래에 파일을 하나 추가하면 됩니다. 파일 이름이 주소가 됩니다(`my-post.md` → `/posts/my-post/`).

```md
---
title: "제목"
description: "목록과 검색 결과에 보일 한두 문장 요약"
date: 2026-10-11
tags: ["태그1", "태그2"]
draft: false   # true면 로컬 미리보기에만 보이고 배포되지 않음
---

본문은 마크다운으로 씁니다.
```

도식이나 인터랙티브 요소가 필요한 글은 `.mdx`로 쓰고 컴포넌트를 불러옵니다.

```mdx
import Q from '../../components/Q.astro';
import Figure from '../../components/Figure.astro';
import MyDiagram from '../../components/diagrams/MyDiagram.jsx';

<Q>이 절이 답하는 질문</Q>

<Figure caption="도식 설명"><MyDiagram /></Figure>
```

- 도식은 `src/components/diagrams/`의 React 컴포넌트입니다. 기본은 빌드 때 정적 SVG로 그려지고, 클릭 같은 동작이 필요할 때만 `<MyDiagram client:visible />`처럼 씁니다.
- 색은 `--cds-*` CSS 변수를 쓰면 밝은/어두운 테마에 자동으로 맞춰집니다 (`src/styles/global.css`).
- 수식은 `<MathBlock tex={String.raw`...`} />`로 넣습니다.

## 로컬에서 보기

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 에 결과물 생성
```

## 설정

- 사이트 이름·소개: `src/site.ts`
- 도메인: `astro.config.mjs`의 `site`, 그리고 GitHub Settings → Pages → Custom domain
