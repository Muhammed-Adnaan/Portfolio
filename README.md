# Portfolio — Muhammed Adnaan Ur Rahmaan

Personal portfolio site. Live at **https://muhammed-adnaan.pages.dev/**

Built with React 19, React Router 7 and Tailwind CSS, deployed on Cloudflare Pages.

## Pages

| Route | Contents |
| --- | --- |
| `/` | Pixel-art landing menu |
| `/about` | Intro, location, social links |
| `/projects` | Project cards, each linking to a detail page |
| `/projects/:slug` | Tech stack, features and screenshot gallery |
| `/skills` | Skills by category, languages spoken |
| `/resume` | Resume preview and download |
| `/contact` | Email, resume download, social profiles |

## Running locally

```bash
npm install
npm start          # dev server on http://localhost:3000
npm run build      # production build into ./build
```

## Notes

- Project screenshots live in `src/components/assets/images/project-pics/` as
  WebP. Keep new ones at 1600px wide or less — they are served as-is.
- `public/_redirects` gives Cloudflare Pages the SPA fallback that makes deep
  links such as `/projects/quill` survive a hard refresh.
- Routes other than the landing page are code-split via `React.lazy`, so add new
  pages to the `lazy(...)` list in `src/App.js`.
