# scalonetapp

## Run locally

Requires Node.js 24, a PostgreSQL database, and a [Clerk](https://clerk.com) development application.

```bash
nvm install
nvm use
npm ci
cp -n .env.template .env.local
```

In `.env.local`, set:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from Clerk Development.
- `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` to your development database URL.
- Optionally, `TELEGRAM_BOTID` and `TELEGRAM_CHATID` to enable feedback.

Keep the other template defaults, then initialize the database and start the app:

```bash
node --env-file=.env.local node_modules/prisma/build/index.js migrate deploy
node --env-file=.env.local node_modules/prisma/build/index.js generate
npm run dev
```

Open [localhost:3000](http://localhost:3000). Keep this port for local image exports.
Environment files are ignored by Git; use development credentials only.

## Analytics

Set `UMAMI_WEBSITE_ID` to the Scaloneta property's public Website ID in Vercel
**Production**. No Umami API key is needed. Collection requires
`VERCEL_ENV=production`; local development and Preview remain disabled even if
that ID is present. Removing the ID disables collection on the next deployment.

The browser loads `/stats/script.js` and sends only to `/stats/api/send`.
The server forwards to Umami Cloud's fixed script/collection endpoints. Tracker
loading and collection are best effort and never block app operations. A proxy
can reduce domain-based blocking; it cannot guarantee complete measurement.

Pageviews cover Home, Dashboard, Matches and Team builder. Private match URLs
are grouped as `/partidos/:match`; queries, fragments, document titles, player
content and account identifiers are omitted. Referrers include only the source
hostname. Umami receives the visitor User-Agent and Vercel-provided IP for its
normal session/location processing; the proxy does not make collection anonymous
or store its own analytics database.

Events distinguish intent (`sign_in_clicked`, `match_create_opened`,
`teams_randomize_clicked`, `teams_balance_clicked`, `export_opened`,
`export_requested`) from completed operations (`match_created`,
`match_duplicated`, `teams_saved`, `export_download_started`). Export errors use
`export_save_failed` or `export_image_failed`, without error text. `teams_saved`
requires a changed, successfully persisted payload. `export_download_started`
means a valid image was received and the browser download dispatched, not that
it finished writing to disk. No event means signup completion.

To exclude your own visits, run `localStorage.setItem('umami.disabled', '1')`
in the site's browser console and reload. Repeat for each browser/origin used
for testing. Remove that key to opt back in. Do Not Track is also respected.
Image-rendering routes never initialize tracking. At low volume, inspect raw
counts and successful journeys before drawing conclusions from conversion rates.
