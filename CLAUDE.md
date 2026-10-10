# Blog repo notes for Claude

Astro static blog published at https://blog.gnu.or.kr via GitHub Actions on push to `main`. The owner writes in Korean; posts and UI copy are Korean.

## Adding a post
- New file in `src/content/posts/<slug>.md` (or `.mdx` when it needs components). Frontmatter: `title`, `description`, `date`, `category` (one name from `CATEGORIES` in `src/site.ts`; the build fails on anything else), `tags`, optional `updated`, `draft`.
- Category = one broad bucket per post; tags = free-form keywords. Don't add a new category without asking the owner.
- The About page is `src/pages/about.md`. Only put things the owner has stated there.
- The owner usually explains the substance; your job is structure, diagrams and wording. Don't invent facts, numbers or claims they did not make — ask.
- Section pattern used so far: a `<Q>` question near the top of each section, then the answer, then a diagram, then the explanation.

## Diagrams
- React components in `src/components/diagrams/`, one per file, inline SVG with `viewBox="0 0 760 H"`.
- Colors only through CSS variables (`--cds-text-primary`, `--cds-text-secondary`, `--cds-chart-axis`, `--cds-chart-grid`, `--cds-chart-reference-tint`, `--cds-chart-categorical-1..4`, `--cds-chart-status-critical`) so light/dark both work.
- Static by default. Add `client:visible` in the MDX only for components that need interaction (e.g. `WindowSimulator`).
- SVG `id`s (markers, gradients) must be unique across the whole page.
- Wrap in `<Figure caption="...">`.

## Before pushing
- `npm run build` must pass.
- Check the rendered pages (light and dark, ~390px mobile width) for overlapping or clipped text in diagrams.
