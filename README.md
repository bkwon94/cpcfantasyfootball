# Cornerstone League Weekly

The Cornerstone League Weekly site, at cpcfantasy.com. This repo holds the Next.js source. The
Python pipeline repo publishes the built week pages into `public/`.

## Install

Use Node 22 or newer. The `.nvmrc` pins 22.

```
pnpm install
```

## Run

```
pnpm dev
```

## Build and export

`pnpm build` writes the static export to `out/`. The export has trailing slashes and no server.

```
pnpm build
pnpm check:export
```

`pnpm check:export` runs after the build. It checks that every file under `public/` exists in
`out/` with the same bytes. It exits 1 and names the first mismatch.

To look at the export, serve `out/`:

```
python3 -m http.server --directory out
```

## Test

```
pnpm test
pnpm typecheck
```

## Config

Both values are build-time. Only `src/lib/config.ts` reads them.

| Variable | Default | Meaning |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.cpcfantasy.com` | Base URL of the site API. |
| `NEXT_PUBLIC_BASE_PATH` | empty string | Pages base path. Empty because the site lives at the domain root. |

## Deploy

A push to `main` builds the site and deploys it. The workflow is `.github/workflows/deploy.yml`.
It installs, checks types, runs the tests, builds the export, and checks the export. A failed
step stops the deploy.

The Pages source is GitHub Actions. The `CNAME` file in `public/` keeps the custom domain.

The Python publish in the pipeline repo writes the built week into `public/` and pushes to
`main`. That push starts the deploy.
