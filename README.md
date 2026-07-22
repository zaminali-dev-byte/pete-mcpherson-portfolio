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

## Newsletter (Cloudflare Worker + KV)

Subscribers are stored in **Cloudflare KV** via a small Worker — no Mailchimp or other ESP.

| Piece | Details |
| ----- | ------- |
| Worker | `workers/newsletter` — project name `pete-newsletter` |
| Endpoint | `POST /subscribe` with JSON `{ "email", "listId" }` |
| Default `listId` | `weekly` (hidden input in `NewsletterForm.astro`) |
| KV binding | `NEWSLETTER_SUBSCRIBERS` |
| Key format | `list:{listId}:email:{email}` |

### Change the list ID

1. Update the hidden `listId` input (or `DEFAULT_LIST_ID`) in `src/components/NewsletterForm.astro`.
2. Rebuild and redeploy Pages.
3. Optionally lock allowed `listId` values in the Worker later for production.

### Deploy / update the Worker

```bash
cd workers/newsletter
npx wrangler deploy
```

### View subscribers in the Cloudflare dashboard

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **KV**.
2. Open the `NEWSLETTER_SUBSCRIBERS` namespace.
3. Look for keys like `list:weekly:email:you@example.com`.
4. Values are JSON: `{ "email", "listId", "subscribedAt" }`.

You can also list keys with Wrangler:

```bash
npx wrangler kv key list --namespace-id=68933cd11ce4471a83605b3312fa91b6 --prefix="list:weekly:"
```

### Worker URL on the site

`NewsletterForm.astro` posts to the deployed Worker URL (constant `NEWSLETTER_API_URL`). Update that constant if the Worker subdomain changes.

## Site structure

- `/` — Home (hero + newsletter CTA + intro)
- `/about` — About story placeholders + newsletter
- `/projects` — Project cards + newsletter

## Stack

- [Astro](https://astro.build/) (static)
- [Tailwind CSS](https://tailwindcss.com/) via `@tailwindcss/vite`
- [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- Fonts: [Khand](https://www.fontshare.com/) + [Switzer](https://www.fontshare.com/) via Fontshare
- Newsletter: Cloudflare Worker + KV (`workers/newsletter`)
