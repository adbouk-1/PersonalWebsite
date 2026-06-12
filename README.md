# alidbouk.com

Personal site of Ali Dbouk — Performance & Simulation Engineer.

A quiet, editorial single page: Newsreader serif, JetBrains Mono details,
ink-navy palette, and a scroll-driven telemetry signal field whispering in
the background as the nod to the day job. Built with **Astro** + **Lenis**
smooth scroll. Fully static, self-hosted fonts,
**no cookies / no third-party requests / no analytics**.

## 🧞 Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Dev server at `localhost:3000`              |
| `npm run build`   | Build production site to `./dist/`          |
| `npm run preview` | Preview the production build locally        |

## ✏️ Editing content

All copy is data-driven — edit the JSON, no component changes needed:

- `src/data/me.json` — name, role, location, email, socials, bio
- `src/data/experience.json` — the experience entries (period, org, role, detail)
- `src/data/projects.json` — selected work (title, summary, tags, year)
- `src/data/skills.json` — focus areas and the tools list

The hero intro paragraph lives in `src/components/Hero.astro`.

## 📝 Writing (blog)

Posts are markdown files in `src/pages/blog/` with `layout: ../../layouts/Post.astro`
frontmatter (`title`, `description`, `date`, `draft`). While `draft: true`, a post
renders in dev but is **excluded from the production build and the index**; flip it
to `false` to publish. `/blog` lists published posts newest-first.

## 🌱 Agryq demo page

`/agryq` embeds the Agryq grants widget in an `<iframe>` as a client-facing demo.
The embed URL is a constant at the top of `src/pages/agryq.astro` — currently
`localhost:4321` for testing; point it at the production host before deploying.
Note: once it points at agryq.com, that page makes a cross-origin request (the
rest of the site remains request-free).

## 📈 The signal field

The background plays back a real lap — currently Kimi's Monaco 2026 pole
(FastF1 export). Seven channels — **vCar, rThrottlePedal, pBrakeF1, gLat,
gLong, nGear, nEngine** — scrub horizontally as you scroll, with live
readouts at the left margin, and a small **track map** at the bottom-right
drawn from the X/Y coordinates shows position on track with a progress
trail and live lap distance.

The flying lap is anchored to the page: the **top of the page is the start
line, the bottom is the finish line**. The final seconds of the lap before
and the opening seconds of the lap after fill the canvas either side of
the playhead, so the trace never runs dry at the extremes of scroll.

Muted tonal colours and a horizontal mask keep it near-silent behind the
content column. The binary `pBrakeF1` flag is post-processed into a
trail-brake profile (fast peak, exponential release, noise, area scaled by
the speed shed into each corner). The g channels come from the export's
acceleration axes (`acc_x` is longitudinal in this data — it tracks
d(speed)/dt — and `acc_y` lateral), converted from m/s² to G.

**To swap laps:** drop three FastF1 lap exports (`NN_tel.json` — the laps
before/of/after the one you want) into `data-src/`, edit the config block
at the top of `scripts/prepare-lap.mjs` (lap numbers, trim lengths, map
caption), and run `node scripts/prepare-lap.mjs`. It writes the single
compact `public/data/lap.json` the site loads; the raw exports in
`data-src/` never deploy. Without a `lap.json`, the field falls back to a
generated lap.

## 🧩 Architecture

- `src/layouts/Base.astro` — head/meta (incl. JSON-LD Person schema), Lenis
  smooth scroll publishing a `telemetry:scroll` progress event,
  scroll-reveal `IntersectionObserver`
- `src/styles/global.css` — design tokens and type system (base colour on
  `<html>` so the fixed signal layer isn't painted over)
- `src/components/SignalField.astro` — the lap.json-driven background channels
- `scripts/prepare-lap.mjs` — stitches three raw lap exports (`data-src/`)
  into `public/data/lap.json`
- Section components: `Hero`, `Experience`, `Projects`, `Skills`, `About`,
  `Contact`, `Footer`, with `SectionHead` shared between them

Respects `prefers-reduced-motion`. Dist is ~1.3 MB, dominated by the
self-hosted variable fonts and CV.

## 🗃️ Archive

`model-src/` (git-ignored) still holds the raw 51 MB Sketchfab F1 model from
an earlier 3D iteration of the site, along with the `@gltf-transform/cli`
pipeline notes in git history, should it ever return.
