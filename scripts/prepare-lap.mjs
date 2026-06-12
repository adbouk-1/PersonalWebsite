#!/usr/bin/env node
// Stitches three FastF1 lap exports (lead-in | flying lap | lead-out) into
// the single public/data/lap.json that SignalField.astro plays back.
//
// The flying lap spans the page top-to-bottom; the final seconds of the
// lead-in lap fill the canvas left of the playhead at scroll-top, and the
// opening seconds of the lead-out lap fill it to the right at scroll-bottom.
//
// To swap laps: drop the new NN_tel.json files into data-src/, edit the
// config below, then run  node scripts/prepare-lap.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---- config -------------------------------------------------------------
const LEAD_IN = 26; // lap whose final seconds precede the flying lap
const LAP = 27; // the flying lap
const LEAD_OUT = 28; // lap whose opening seconds follow it
const LEAD_IN_SECONDS = 10; // how much of the lead-in to keep
const LEAD_OUT_SECONDS = 20; // how much of the lead-out to keep
const TITLE = ["Kimi · pole lap", "Monaco 2026"]; // track-map caption
// ---------------------------------------------------------------------------

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const load = (n) =>
  JSON.parse(readFileSync(resolve(root, `data-src/${n}_tel.json`))).tel;

const lead = load(LEAD_IN);
const lap = load(LAP);
const out = load(LEAD_OUT);

// keep only the tail of the lead-in / head of the lead-out
const tailFrom = (t, secs) => {
  const end = t.time[t.time.length - 1];
  let i = 0;
  while (t.time[i] < end - secs) i++;
  return i;
};
const headTo = (t, secs) => {
  let i = 0;
  while (i < t.time.length && t.time[i] <= secs) i++;
  return i;
};
const a0 = tailFrom(lead, LEAD_IN_SECONDS);
const c1 = headTo(out, LEAD_OUT_SECONDS);

const round = (dp) => (v) => +(+v).toFixed(dp);
const cat = (key, fn) =>
  [...lead[key].slice(a0), ...lap[key], ...out[key].slice(0, c1)].map(fn);

// continuous distance: negative through the lead-in, 0..lapLen on the lap,
// past lapLen on the lead-out — the playhead only ever reads the lap range
const lapLen = lap.distance[lap.distance.length - 1];
const leadEnd = lead.distance[lead.distance.length - 1];
const dist = [
  ...lead.distance.slice(a0).map((v) => v - leadEnd),
  ...lap.distance,
  ...out.distance.slice(0, c1).map((v) => v + lapLen),
].map(round(1));

// acc axes: in this export acc_x correlates ~0.99 with d(speed)/dt, so
// acc_x is longitudinal (gLong) and acc_y lateral (gLat); both m/s² -> G
const G = 9.81;

const pre = lead.time.length - a0;
const result = {
  title: TITLE,
  source: lap.dataKey,
  lapTime: round(3)(lap.time[lap.time.length - 1]),
  lap: [pre, pre + lap.time.length - 1],
  ch: {
    speed: cat("speed", round(1)),
    throttle: cat("throttle", round(0)),
    brake: cat("brake", round(0)),
    glat: cat("acc_y", (v) => round(2)(v / G)),
    glong: cat("acc_x", (v) => round(2)(v / G)),
    gear: cat("gear", round(0)),
    rpm: cat("rpm", round(0)),
    dist,
    x: cat("x", round(1)),
    y: cat("y", round(1)),
    z: cat("z", round(1)),
  },
};

const dest = resolve(root, "public/data/lap.json");
writeFileSync(dest, JSON.stringify(result));
const n = result.ch.speed.length;
console.log(
  `lap.json: ${n} samples (${pre} lead-in | ${lap.time.length} lap | ${
    n - pre - lap.time.length
  } lead-out), lap ${result.lapTime}s, ${(
    JSON.stringify(result).length / 1024
  ).toFixed(0)} KB — ${result.source}`
);
