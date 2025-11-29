---
title: "Loadguard — Dashboard & AI PRD"
owner: "Loadguard"
status: "MVP"
last_updated: "2025-10-29"
tags: ["telemetry","dynamodb","lambda","vercel","alerts","agent"]
doc_type: "prd"
---

## 1) Purpose
Provide a live, reliable view of field devices; enrich raw telemetry with coarse location and quality signals; detect anomalies near‑real‑time; expose the data to a web dashboard and a conversational agent; notify on conditions that matter.

## 2) Primary Users & Jobs
- Ops/Field: locate devices, verify health, see changes.
- Engineering: inspect signals, validate firmware/sensors.
- Leadership: high‑level fleet health & coverage.

## 3) In‑Scope (MVP)
- Keep `rx` Lambda + `MonarchData` (done).
- Add `pp` Lambda (post‑processing) + `Post_Processed` table.
- Dashboard on Vercel: device list, device detail (latest, charts, map), alerts feed.
- Agent: “chat with your data” over `Post_Processed`, plus basic alert routing.

_Non‑Goals (MVP):_ heavy ML, mutations of raw data, precise GPS beyond cell‑based, long‑term backfill tooling.

## 4) System Flow
Edge ➜ **rx Lambda** ➜ **MonarchData** ➜ **pp Lambda** (enrich + flags) ➜ **Post_Processed** ➜ **API** ➜ Dashboard & Agent.

## 5) Data Contracts

### 5.1 `Post_Processed` (Time‑series, dashboard source)
- **PK**: `device_id` (String)  
- **SK**: `ts` (Number, ms)
- **Attrs**:
  - `lat` (Number), `lon` (Number), `loc_acc_m` (Number|null), `loc_src` (String: `cell_mls`|`cell_unwired`|`cache`|`none`|`error`)
  - `cell_key` (String: `mcc-mnc-tac-cid`)
  - `env`: `{ temp_c, hum_pct, lux, white }`
  - `imu`: `{ pitch, roll, yaw, ax, ay, az, gx, gy, gz, mx, my, mz, lx, ly, lz }`
  - `sig`: `{ rsrp, rsrq, rssi, cinr, band, earfcn, pci, mcc, mnc, tac, cid }`
  - `flags`: `{ temp_anom, hum_anom, light_anom, move_anom, signal_anom, geo_anom }`
  - `zscores` (optional): `{ temp, hum, lux, rsrp, move }`
  - `meta`: `{ index, server_ts, source: "MonarchData", version: "pp-1" }`
  - _(optional)_ `anomaly` = `"1"` if any flag true (for alert feed)
- **Indexes**
  - Primary: `(device_id, ts)`
  - Optional GSI1 (alerts): `anomaly` (PK), `ts` (SK)

### 5.2 `PP_State` (Per‑device rolling state)
- **PK**: `device_id`  
- **Attrs**:  
  `ema`:{ temp, hum, lux, rsrp, move },  
  `emavar`:{ temp, hum, lux, rsrp, move },  
  `n` (count),  
  `last`:{ ts, lat, lon }

### 5.3 `CellCache` (Cell→GPS cache)
- **PK**: `cell_key`  
- **Attrs**: `{ lat, lon, accuracy, provider, updated_ts }`  
- Optional TTL: `ttl_epoch`.

## 6) Post‑Processing (pp Lambda) — Required Behavior
**Trigger:** DynamoDB Streams (NEW_IMAGE) on `MonarchData` for `INSERT`/`MODIFY`.

**Input:** item with `device_id`, `timestamp`/`server_timestamp`, and `decoded_data`.

**Steps:**
1. **Normalize time:**  
   `ts = decoded_data.timestamp || item.timestamp || item.server_timestamp`.
2. **Cell geolocation:**  
   Build `cell_key` from `mcc/mnc/tac/cid` (skip if zero/missing).  
   Try `CellCache`; if miss and lookups enabled, call provider; then cache.  
   Output: `lat/lon/loc_acc_m/loc_src`.
3. **Rolling stats & flags:**  
   Maintain per‑device EWMA mean/variance for `{ temp, hum, lux, rsrp, move }`.  
   z‑score threshold: `|z| ≥ 3` (tunable). Warm‑up before flagging (~10 eff. samples).  
   Movement proxy: magnitude from Euler + accel; flag `move_anom` via z‑score.  
   Geo jump: compute haversine distance vs time since `PP_State.last`; flag if speed > guard.
4. **Write** enriched row to `Post_Processed` at `(device_id, ts)`; set `anomaly="1"` if any flag.
5. **Update** `PP_State` with new `ema`, `emavar`, `n`, and `last:{ ts, lat, lon }`.

**Config via env (examples):**
- `POSTPROCESSED_TABLE`, `PP_STATE_TABLE`, `CELL_CACHE_TABLE`
- `GEO_PROVIDER` (`MLS`|`UNWIRED`), `MLS_API_KEY` / `UNWIRED_TOKEN`, `GEO_LOOKUP` (true/false)
- `EWMA_ALPHA` (default 0.1), `ANOM_Z` (default 3), `SPEED_MPS_MAX` (geo jump guard)

## 7) Dashboard (Vercel) — Product Requirements
**Pages**
- **Devices list:** search, last seen, quick status (flags seen in last N hrs).
- **Device detail:** latest card (env/signal/location), 24h charts (env, orientation, signal), map (pin + accuracy), recent flags.
- **Alerts feed:** recent anomalies; filter by device/metric.
- **Data inspector:** rows for current device/time; export.

**Controls**: device picker; time range (1h/24h/7d/custom); auto‑refresh toggle.  
**UX**: show data within ~2s for typical ranges; clear empty/loading states.

## 8) Agent (“Chat with your data”) & Alerts — Requirements
**Agent**
- **Q&A:** trends, latest state, comparisons, where/when queries (coarse location).  
- **Actions:** subscribe/unsubscribe alerts; daily/weekly anomaly summaries; shareable links to dashboard views.  
- **Grounding:** cite frames used (device/time); note location accuracy/source.

**Alerting**
- **Events:** z‑score anomalies, geo jumps, data gaps (no data > X mins).  
- **Routing:** email/Slack; de‑dupe within cooldown; include dashboard deep‑link.  
- **User control:** per device/metric subscriptions; global on/off.

**Data Access:** read‑only over `Post_Processed` (+ GSI if present); paginated; capped result sizes.

## 9) Minimal APIs (contract level)
- `GET /api/pp/:deviceId?from=&to=&limit=&onlyAnomalies=`  
  → `{ frames:[ { ts, lat, lon, env, imu, sig, flags, zscores, meta } ] }`
- _(optional)_ `GET /api/alerts?from=&to=&deviceId=`

## 10) Reliability, Security, Cost Expectations
- Streams are at‑least‑once; `pp` must be idempotent on `(device_id, ts)`.  
- Secrets stay server‑side; dashboard hits server routes only.  
- Aggressive `CellCache`; avoid repeated external geolocation calls.  
- Cap per‑query rows + paginate; backpressure safe.  
- Logging: event IDs; counters (processed/flagged/geolocated/cache‑hit).

## 11) Success Metrics
- Ingest ➜ enriched row: P50 < 2s, P95 < 5s.  
- Dashboard TTFB (24h, single device): < 2s.  
- False positive anomaly rate < 5% after tuning.  
- Cell geolocation cache hit > 70% after warm‑up.  
- Agent answer latency: < 3s simple, < 8s aggregates.

## 12) Acceptance (MVP DoD)
- New write to `MonarchData` produces `Post_Processed` row with location (when cell data valid) and flags.  
- Dashboard shows latest + last‑24h charts + map for a real device.  
- Alerts feed lists anomalies; one routed notification verified end‑to‑end.  
- Agent answers basic what/when/where for a device/time range with cited frames.

## 13) Open Questions
- Preferred geolocation provider/quota and acceptable accuracy floor?  
- Alert routing destinations + default cooldowns?  
- Backfill approach for existing `MonarchData` (if needed)?  
- Retention policy for `Post_Processed` and caches?  
- Any compliance constraints for storing coarse location?

## 14) Task Checklist (MVP)
- [ ] Create tables: `Post_Processed`, `PP_State`, `CellCache` (TTL optional).
- [ ] Add pp Lambda env + IAM (least‑privilege for the three tables).
- [ ] Enable `MonarchData` stream (NEW_IMAGE) + connect pp Lambda.
- [ ] Implement pp logic (time normalize, geo, EWMA, flags, writes).
- [ ] Smoke test with a new `MonarchData` item; verify `Post_Processed`.
- [ ] Expose minimal API for dashboard; wire device list/detail + charts + map.
- [ ] Alerts feed in UI; send one routed alert end‑to‑end.
- [ ] Agent reads `Post_Processed`; answer basic queries with citations.
