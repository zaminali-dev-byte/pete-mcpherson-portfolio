# Pete McPherson Portfolio

Minimal Astro + Tailwind portfolio site for Pete McPherson. Placeholder content only — replace `[PLACEHOLDER: ...]` copy before launch. Primary conversion action is newsletter signup.

## Setup

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:4321`).

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the local development server |
| `npm run build`   | Build a static site to `dist/`     |
| `npm run preview` | Preview the production build       |

## Build

```bash
npm run build
```

Static output is written to the `dist/` directory.

## Cloudflare Pages deployment

This project uses Astro **static** output (`output: 'static'`), which works on the Cloudflare Pages free plan.

1. Push this repository to GitHub (or another Git provider Cloudflare supports).
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** → **Create** → **Pages** → connect your repository.
3. Configure the build:

   | Setting            | Value          |
   | ------------------ | -------------- |
   | Framework preset   | Astro (or None)|
   | Build command      | `npm run build`|
   | Build output directory | `dist`     |
   | Node.js version    | `22` (or latest LTS that meets `engines` in `package.json`) |

4. Deploy. Cloudflare will build on each push to the connected branch.
5. After you have a production URL, update:

   - `site` in `astro.config.mjs` (used by `@astrojs/sitemap`)
   - the `Sitemap:` URL in `public/robots.txt`

### Optional: Wrangler direct upload

```bash
npm run build
npx wrangler pages deploy dist --project-name=pete-mcpherson-portfolio
```

## Site structure

- `/` — Home (hero + newsletter CTA + intro)
- `/about` — About story placeholders + newsletter
- `/projects` — Project cards + newsletter

## Stack

- [Astro](https://astro.build/) (static)
- [Tailwind CSS](https://tailwindcss.com/) via `@tailwindcss/vite`
- [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- Fonts: [Khand](https://www.fontshare.com/) + [Switzer](https://www.fontshare.com/) via Fontshare
