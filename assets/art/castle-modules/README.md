# Royal Academy castle modules

These transparent PNG cutouts come from `../royal-academy-castle-tileset.png`
(1536 x 1024, RGBA). The source sheet contains headings, captions, and some
low-alpha edge residue; the cutouts omit those and retain the antialiased
artwork. The in-game isometric castle is composed from these separate sprites
in `../../isometric-courtyard.js`.

## Extracted modules

- Walls: `wall-straight`, `wall-window`, `wall-banner`, `wall-column`,
  `wall-long`, `wall-short`, `wall-corner-outer`, `wall-corner-inner`,
  `wall-buttress`, `wall-end`, `gate-pillar`
- Roofs: `roof-straight`, `roof-corner-left`, `roof-corner-right`, `roof-end`,
  `roof-ridge`, `roof-valley`, `roof-central-large`, `roof-spire`
- Towers: `tower-round`, `tower-square`, `tower-tall-spire`, `tower-corner`
- Entrances and stairs: `entrance-double-doors`, `entrance-arch`,
  `grand-staircase`, `landing-platform`, `stair-segment`, `stair-balustrade`,
  `stair-corner`, `stair-newel-post`

## Edge compatibility

No pair in this sheet is certified as a pixel-seamless tile. The straight wall
variants share a similar facade scale and can be arranged in a wall run, but
their side faces, flowers, banners, and shadows overlap or differ at the ends.
The outer/inner corner pieces and `wall-long` are useful for shaping returns,
not seamless continuation pieces.

`roof-straight`, the left/right roof corners, `roof-end`, `roof-ridge`, and
`roof-valley` look like a compatible architectural family, but their rendered
edges and perspective do not prove matching seams. The assembled castle
overlaps these pieces visually rather than claiming exact tileability. Towers
are standalone silhouettes. The entrance and stair pieces have fixed,
decorated footprints and should not be repeated as tiles.

`roof-spire` is extracted but intentionally not placed: its illustrated cap
and pedestal are separated in the source, and the sheet does not provide a
verified mounting profile for the central roof.

## Follow-up artwork

For reliable expansion, create undecorated wall and roof variants with
deliberately matched edge profiles, plus seam-tested corner and ridge junctions.
The current wall flowers/banners can intrude at joins, roof angles need manual
alignment, and the smaller stair/landing parts do not establish a guaranteed
joint with the grand staircase. Use the existing pieces as manually composed
sprites until those assets are supplied.
