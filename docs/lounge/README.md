# Energica — People & Passion

A responsive, buildless prototype with four pages: Community, Collections, Garage and Ride Intelligence.

## Run

Serve `public/lounge/` with a static HTTP server. No installation or build is required.
Served at https://lounge.energicamotor.com from `public/lounge/` of the main site repo; host routing is in `next.config.ts`.

## Experience

- Original Energica logo extracted with its transparency from the supplied `Energica_Sept 20.pdf`.
  Brand green `#78be20`, drawn from the same materials, on a dark interface.
- Supplied lounge photograph as the background of Community and Collections.
- One expanding chat bar in the sticky header. The Organiser, Curator, Mechanic and Coach
  share a conversation as the user moves between the four pages. No floating chat launcher.
- Community has editable known-rider records, riding preferences, rider selection, local ride
  plans and editable invitation drafts. Each recipient is visible before opening email or
  WhatsApp; the user completes sending in their own account. No background sending is implemented.
  Example riders are clearly labelled and disappear when the first real contact is added.
- Collections has category filters, real maker selections, concept objects, saved items and a preview shopping bag.
  There is no search bar. The Curator can suggest objects and open a relevant collection.
- Garage supports multiple motorcycle makes/models, nicknames, years and odometers. Each
  motorcycle has independent checklist state and service notes. The Mechanic uses the selected
  motorcycle, and the prior single-bike profile is migrated without discarding notes or checks.
- Rider profile settings include personal details, riding experience/pace/interests, response
  style, optional local conversation memory, imported-ride storage and a JSON data export.
- Ride Intelligence retains sample journeys, GPX/JSON import, route schematics, speed/lean/battery
  charts, timeline scrubbing, CSV export and local dashcam playback with time offset.

## Data and AI boundaries

The assistant uses deterministic local preview responses, not a live model. The catalogue combines
real maker selections with labelled Energica concepts. Maker reference prices were checked on
27 October 2026; they are not live quotes. Concept prices, example riders and sample journeys are illustrative. No payments, autonomous messages,
bookings, online identity, live vehicle diagnosis, tracking or external data sharing are connected.

Preferences, known riders, motorcycles and plans are stored in browser local storage. Imported
rides are remembered only when enabled. Text conversation history can be remembered explicitly;
photos are never included in persisted conversation history. LocalStorage is not encrypted, so
production should use authenticated access and appropriate secure storage before real customer use.

## Ride JSON schema

```json
{
  "name": "My ride",
  "points": [
    {"t": 0, "lat": 44.60, "lon": 10.90, "speed": 0, "lean": 0, "battery": 92},
    {"t": 30, "lat": 44.603, "lon": 10.904, "speed": 55, "lean": 14, "battery": 91}
  ]
}
```

`t` is elapsed seconds. ISO `time`/`timestamp` strings are also accepted. Speed is km/h,
lean is degrees, battery is percent. Latitude and longitude are required. Missing speed is
computed from GPS/time; missing lean or battery remains unavailable. GPX track/route points
are supported. Without timestamps, timing is estimated at five seconds per point and labelled.
Imports are limited to 10 MB and 20,000 points.

## Production integration

1. Replace `demoResponse` with a secure authenticated agent service, sharing user-authorised
   motorcycle, ride and contact context while preserving per-action recipient review.
2. Connect a verified product catalogue, availability, compatibility and checkout.
3. Add authenticated rider profiles, secure durable storage, consent, deletion and export.
4. Connect vehicle/dashcam ingestion, validate telemetry units and clock alignment.
5. Replace sample content and concept products with validated content before public launch.

## Assets

- Logo and motorcycle/touring photographs come from user-supplied Energica materials.
- Lounge photograph supplied by the user.
- Concept product illustrations are editable inline SVG.
- Lucide icons are vendored under the ISC licence in `dist/assets/`.

## Rider QR and quick invitations
Each saved rider and the personal profile has a QR, shareable link and PNG download.
Camera scans, QR image imports and pasted links show a review before saving.
Names, motorcycle and pace are included; contact fields are opt-in. Private notes are
never encoded. Duplicate imports update the same rider and preserve private notes.
Quick invitations require only phone or email and open editable email, SMS or WhatsApp
drafts. The user completes sending. Camera tracks stop when the dialog closes or the
tab is hidden. QR generation/scanning are local with vendored qrcode-generator 1.4.4
(MIT) and jsQR 1.4.0 (Apache-2.0); licences are in dist/assets.
All four page hero headings are removed; navigation and functional section titles remain.

## Official 2026 visual identity

The interface follows the Energica Visual Branding Toolkit at energicamotor.com/brand-guide.html:
Energica Green `#78BE20`, black/graphite/carbon surfaces, Barlow Condensed display and UI type,
IBM Plex Sans body copy, IBM Plex Mono technical labels, square geometry, and restrained green
signals. The official horizontal logo is kept on a plain black field with clearance from the
People & Passion experience name. “Progress, Ridden.” appears as the corporate line in the footer.
The supplied lounge photograph remains an atmospheric background under a strong black overlay.


## Curated maker collection — 27 October 2026

Added 13 requested examples in a mixed editorial order, before the eight existing concept objects.
Product data lives in `dist/catalogue.js`. Maker photographs are local WebP assets, with sources
recorded in `docs/collection-sources.md`. Every maker selection has an external product/shop/project
link; no checkout, reseller agreement or live stock integration is implied.

- Food & wine is a new filter alongside Style, Accessories, Robotics, Italian devices and Riding.
- OpenCat is represented by current Petoi Bittle X hardware, with the original repository retained
  as a source link and the legacy-vs-ESP32 hardware distinction explained.
- OpenExo is a research-platform enquiry, explicitly not a retail or medical device.
- References retain EUR/USD pricing; enquiries have no invented numeric price. The preview bag
  shows an item count instead of adding different currencies or treating enquiries as zero-priced.
- The Curator can match the new brands, named objects and food/wine category locally.

Verified: JavaScript syntax, catalogue/image/link integrity, desktop and 390px mobile rendering,
category filtering, save/unsave, add/remove preview-bag item, research detail modal, and Curator
recommendation of Unitree G1. Product links were checked in the rendered UI without placing orders.

## Enquiries to Energica (November 2026)

Four buttons open one shared form (`public/lounge/lead.js`) that posts to `/api/lounge`
(`app/api/lounge/route.ts`, validation in `lib/lounge-lead.ts`). Each enquiry is emailed through
Resend to the website enquiry inbox (`ENQUIRY_TO_EMAIL` / `ENQUIRY_CC_EMAIL`, subject prefix `[Lounge]`).

| Button | Where | Sent with the form |
|---|---|---|
| Register interest | Collections → Energica concept items only | item, maker |
| Register interest in Energica items | Preview bag (only if it holds Energica concepts) | Energica concept items and quantities |
| Request a service | Garage → mechanic card | motorcycle, year, odometer |
| Join the Energica community | Profile → Personal | motorcycle, experience, pace, interests |

Per management (Shivangi, Nov 2026): no ride join or ride-plan sharing until real events exist, and
no enquiries for third-party maker products until agreements are in place. The API rejects those kinds.

The visitor sees everything that will be sent and must tick consent. Saved riders' contacts, notes,
rides and videos are never sent. Bots are filtered by a hidden field and a minimum fill time;
there is a per-IP limit of 5 enquiries per 10 minutes. Enquiries are not stored in a database.
