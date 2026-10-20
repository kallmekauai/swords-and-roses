const ISO_TILE_WIDTH = 64;
const ISO_TILE_HEIGHT = 32;

const ISO_MAP_COLUMNS = 40;
const ISO_MAP_ROWS = 28;
const ISO_TERRAIN_MARGIN = 8;
const ISO_TERRAIN_MIN_X = -ISO_TERRAIN_MARGIN;
const ISO_TERRAIN_MIN_Y = -ISO_TERRAIN_MARGIN;
const ISO_TERRAIN_MAX_X = ISO_MAP_COLUMNS + ISO_TERRAIN_MARGIN - 1;
const ISO_TERRAIN_MAX_Y = ISO_MAP_ROWS + ISO_TERRAIN_MARGIN - 1;
const ISO_TERRAIN_HORIZON_TILE_SUM = 14;
const ISO_ORIGIN_X = ISO_MAP_ROWS * ISO_TILE_WIDTH / 2 + 32;
const ISO_ORIGIN_Y = 120;
const ISO_WORLD_MIN_X = ISO_ORIGIN_X +
  (ISO_TERRAIN_MIN_X - ISO_TERRAIN_MAX_Y) * ISO_TILE_WIDTH / 2 -
  ISO_TILE_WIDTH / 2;
const ISO_WORLD_MAX_X = ISO_ORIGIN_X +
  (ISO_TERRAIN_MAX_X - ISO_TERRAIN_MIN_Y) * ISO_TILE_WIDTH / 2 +
  ISO_TILE_WIDTH / 2;
const ISO_WORLD_MIN_Y = ISO_ORIGIN_Y +
  (ISO_TERRAIN_MIN_X + ISO_TERRAIN_MIN_Y) * ISO_TILE_HEIGHT / 2 -
  ISO_TILE_HEIGHT / 2;
const ISO_WORLD_MAX_Y = ISO_ORIGIN_Y +
  (ISO_TERRAIN_MAX_X + ISO_TERRAIN_MAX_Y) * ISO_TILE_HEIGHT / 2 +
  ISO_TILE_HEIGHT / 2;
const ISO_WORLD_BOUNDS = {
  x: ISO_WORLD_MIN_X,
  y: ISO_WORLD_MIN_Y,
  width: ISO_WORLD_MAX_X - ISO_WORLD_MIN_X,
  height: ISO_WORLD_MAX_Y - ISO_WORLD_MIN_Y
};
const ISO_FOUNTAIN_TILE = { x: 14, y: 12 };
const ISO_PLAYER_SPAWN_TILE = { x: 9, y: 15 };
const ISO_CASTLE_ENTRANCE_TILE = { x: 10, y: 8 };
const ISO_STAIRWAY_HALF_WIDTH = 25;
const ISO_STAIRWAY_APPROACH_PROGRESS = -0.12;
const ISO_STAIRWAY_EXIT_PROGRESS = 1.08;
const ISO_STAIRWAY_RAIL_OFFSET = 47;
const ISO_STAIRWAY_ART_PATH = [
  { progress: 0, x: 108, y: 214 },
  { progress: 0.5, x: 106, y: 130 },
  { progress: 1, x: 104, y: 46 }
];
const ISO_PATH_SEGMENTS = [
  [{ x: 8, y: 6 }, { x: 12, y: 10 }],
  [{ x: 12, y: 10 }, { x: 11, y: 11 }],
  [{ x: 11, y: 11 }, { x: 11, y: 12 }],
  [{ x: 11, y: 12 }, { x: 14, y: 15 }],
  [{ x: 14, y: 15 }, { x: 17, y: 12 }],
  [{ x: 12, y: 10 }, { x: 14, y: 12 }],
  [{ x: 12, y: 10 }, { x: 13, y: 10 }],
  [{ x: 13, y: 10 }, { x: 14, y: 9 }],
  [{ x: 14, y: 9 }, { x: 17, y: 12 }],
  [{ x: 9, y: 15 }, { x: 12, y: 12 }]
];

function distanceToIsoSegment(tileX, tileY, start, end) {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const segmentLengthSquared = segmentX ** 2 + segmentY ** 2;
  const projection = segmentLengthSquared === 0
    ? 0
    : Phaser.Math.Clamp(
      ((tileX - start.x) * segmentX + (tileY - start.y) * segmentY) /
        segmentLengthSquared,
      0,
      1
    );
  const nearestX = start.x + projection * segmentX;
  const nearestY = start.y + projection * segmentY;

  return Math.hypot(tileX - nearestX, tileY - nearestY);
}

function isIsoPavedTile(tileX, tileY) {
  const pathDistance = Math.min(
    ...ISO_PATH_SEGMENTS.map(([start, end]) =>
      distanceToIsoSegment(tileX, tileY, start, end)
    )
  );
  const isFountainPlaza =
    (tileX - ISO_FOUNTAIN_TILE.x) ** 2 +
      (tileY - ISO_FOUNTAIN_TILE.y) ** 2 <= 7;

  return pathDistance <= 0.8 || isFountainPlaza;
}

function getStairwayPoint(progress, staircaseSprite) {
  let segmentIndex = ISO_STAIRWAY_ART_PATH.findIndex(
    (point, index) =>
      index < ISO_STAIRWAY_ART_PATH.length - 1 &&
      progress <= ISO_STAIRWAY_ART_PATH[index + 1].progress
  );
  if (segmentIndex < 0) segmentIndex = ISO_STAIRWAY_ART_PATH.length - 2;

  const start = ISO_STAIRWAY_ART_PATH[segmentIndex];
  const end = ISO_STAIRWAY_ART_PATH[segmentIndex + 1];
  const segmentProgress = (progress - start.progress) /
    (end.progress - start.progress);
  const imageX = start.x + (end.x - start.x) * segmentProgress;
  const imageY = start.y + (end.y - start.y) * segmentProgress;

  return {
    x: staircaseSprite.x - staircaseSprite.displayWidth * staircaseSprite.originX +
      imageX * Math.abs(staircaseSprite.scaleX),
    y: staircaseSprite.y - staircaseSprite.displayHeight * staircaseSprite.originY +
      imageY * Math.abs(staircaseSprite.scaleY)
  };
}

function getStairwayProgress(worldX, worldY, staircaseSprite) {
  const pathBreaks = [
    ISO_STAIRWAY_APPROACH_PROGRESS,
    ...ISO_STAIRWAY_ART_PATH.map(({ progress }) => progress),
    ISO_STAIRWAY_EXIT_PROGRESS
  ];
  let progress = pathBreaks[0];
  let point = getStairwayPoint(progress, staircaseSprite);
  let distanceSquared = Infinity;

  for (let index = 0; index < pathBreaks.length - 1; index++) {
    const startProgress = pathBreaks[index];
    const endProgress = pathBreaks[index + 1];
    const start = getStairwayPoint(startProgress, staircaseSprite);
    const end = getStairwayPoint(endProgress, staircaseSprite);
    const segmentX = end.x - start.x;
    const segmentY = end.y - start.y;
    const segmentLengthSquared = segmentX ** 2 + segmentY ** 2;
    const projection = Phaser.Math.Clamp(
      ((worldX - start.x) * segmentX + (worldY - start.y) * segmentY) /
        segmentLengthSquared,
      0,
      1
    );
    const candidateProgress = startProgress +
      (endProgress - startProgress) * projection;
    const candidate = getStairwayPoint(candidateProgress, staircaseSprite);
    const candidateDistanceSquared =
      (worldX - candidate.x) ** 2 + (worldY - candidate.y) ** 2;
    if (candidateDistanceSquared >= distanceSquared) continue;
    progress = candidateProgress;
    point = candidate;
    distanceSquared = candidateDistanceSquared;
  }

  const before = getStairwayPoint(
    Math.max(ISO_STAIRWAY_APPROACH_PROGRESS, progress - 0.01),
    staircaseSprite
  );
  const after = getStairwayPoint(
    Math.min(ISO_STAIRWAY_EXIT_PROGRESS, progress + 0.01),
    staircaseSprite
  );
  const directionX = after.x - before.x;
  const directionY = after.y - before.y;
  const directionLength = Math.hypot(directionX, directionY);

  return {
    progress,
    distance: Math.sqrt(distanceSquared),
    point,
    direction: {
      x: directionX / directionLength,
      y: directionY / directionLength
    }
  };
}

function castlePair({
  id,
  key,
  path,
  rightKey = key,
  rightPath = path,
  offsetX,
  offsetY = 0,
  scale = 1,
  depthOffset = 0,
  flipRight = true
}) {
  const left = {
    id: `${id}-left`,
    key,
    path,
    offsetX: -offsetX,
    offsetY,
    scale,
    depthOffset
  };
  const right = {
    id: `${id}-right`,
    key: rightKey,
    path: rightPath,
    offsetX,
    offsetY,
    scale,
    depthOffset
  };
  if (flipRight) right.flipX = true;

  return [left, right];
}

const ISO_ASSET_MANIFEST = {
  ground: [{
    key: 'iso-cobblestone-tile',
    path: 'assets/art/academy-cobblestone-tile.png'
  }, {
    key: 'iso-grass-tile',
    path: 'assets/art/courtyard-tiles/grass-tile.png'
  }],
  buildings: [],
  castle: [
    ...[-472, -354, -236, -118, 0, 118, 236, 354, 472].map(
      (offsetX, index) => ({
        id: `castle-rear-wall-${index + 1}`,
        key: 'castle-wall-straight',
        path: 'assets/art/castle-modules/wall-straight.png',
        offsetX,
        offsetY: -42,
        scale: 1,
        depthOffset: -1000,
        flipX: index % 2 === 1
      })
    ),
    {
      id: 'castle-roof-center',
      key: 'castle-roof-central',
      path: 'assets/art/castle-modules/roof-central-large.png',
      offsetX: 0,
      offsetY: -140,
      scale: 1.1
    },
    ...castlePair({
      id: 'castle-roof-inner',
      key: 'castle-roof-corner-left',
      path: 'assets/art/castle-modules/roof-corner-left.png',
      rightKey: 'castle-roof-corner-right',
      rightPath: 'assets/art/castle-modules/roof-corner-right.png',
      offsetX: 150,
      offsetY: -140,
      flipRight: false
    }),
    ...[260, 375, 490].flatMap((offsetX, index) => castlePair({
      id: `castle-roof-wing-${index + 1}`,
      key: 'castle-roof-straight',
      path: 'assets/art/castle-modules/roof-straight.png',
      offsetX,
      offsetY: -138
    })),
    ...castlePair({
      id: 'castle-roof-end',
      key: 'castle-roof-end',
      path: 'assets/art/castle-modules/roof-end.png',
      offsetX: 590,
      offsetY: -138
    }),
    ...castlePair({
      id: 'castle-wall-inner',
      key: 'castle-wall-straight',
      path: 'assets/art/castle-modules/wall-straight.png',
      offsetX: 160
    }),
    ...castlePair({
      id: 'castle-entrance-column',
      key: 'castle-wall-column',
      path: 'assets/art/castle-modules/wall-column.png',
      offsetX: 112,
      scale: 0.9
    }),
    ...castlePair({
      id: 'castle-window',
      key: 'castle-wall-window',
      path: 'assets/art/castle-modules/wall-window.png',
      offsetX: 260
    }),
    ...castlePair({
      id: 'castle-banner',
      key: 'castle-wall-banner',
      path: 'assets/art/castle-modules/wall-banner.png',
      offsetX: 355
    }),
    ...castlePair({
      id: 'castle-wing-wall',
      key: 'castle-wall-long',
      path: 'assets/art/castle-modules/wall-long.png',
      offsetX: 470
    }),
    ...castlePair({
      id: 'castle-inner-tower',
      key: 'castle-tower-tall-spire',
      path: 'assets/art/castle-modules/tower-tall-spire.png',
      offsetX: 385,
      offsetY: -14,
      scale: 1.05
    }),
    ...castlePair({
      id: 'castle-outer-tower',
      key: 'castle-tower-round',
      path: 'assets/art/castle-modules/tower-round.png',
      offsetX: 600,
      offsetY: 10,
      scale: 1.12
    }),
    {
      id: 'castle-entrance',
      key: 'castle-double-doors',
      path: 'assets/art/castle-modules/entrance-double-doors.png',
      offsetX: 0,
      offsetY: 3,
      scale: 1
    },
    {
      id: 'castle-grand-staircase',
      key: 'castle-grand-staircase',
      path: 'assets/art/castle-modules/grand-staircase.png',
      offsetX: 0,
      offsetY: 58,
      scale: 0.9,
      depthOffset: 1
    }
  ],
  decorations: [
    {
      id: 'rose-bush-west',
      key: 'iso-rose-bush',
      path: 'assets/art/rose-bush.png',
      tileX: 8,
      tileY: 17,
      scale: 0.62,
      collision: { x: 72, y: 194, width: 92, height: 30 }
    },
    {
      id: 'rose-bush-west-small',
      key: 'iso-rose-bush-small',
      path: 'assets/art/rose-bush-small.png',
      tileX: 13,
      tileY: 17,
      scale: 0.62,
      collision: { x: 44, y: 118, width: 82, height: 28 }
    },
    {
      id: 'rose-bush-south-west',
      key: 'iso-rose-bush-large',
      path: 'assets/art/rose-bush-large.png',
      tileX: 6,
      tileY: 20,
      scale: 0.52,
      collision: { x: 66, y: 190, width: 82, height: 30 }
    },
    {
      id: 'rose-bush-south-east',
      key: 'iso-rose-bush-small',
      path: 'assets/art/rose-bush-small.png',
      tileX: 19,
      tileY: 9,
      scale: 0.58,
      collision: { x: 45, y: 118, width: 82, height: 28 }
    },
    {
      id: 'pink-ornamental-tree',
      key: 'iso-pink-tree',
      path: 'assets/art/ornamental-tree-pink.png',
      tileX: 4,
      tileY: 16,
      scale: 0.82,
      collision: { x: 89, y: 201, width: 54, height: 31 }
    },
    {
      id: 'green-ornamental-tree',
      key: 'iso-green-tree',
      path: 'assets/art/ornamental-tree-green.png',
      tileX: 20,
      tileY: 3,
      scale: 0.78,
      collision: { x: 77, y: 193, width: 48, height: 32 }
    },
    {
      id: 'cypress-tree-west',
      key: 'iso-cypress-tree',
      path: 'assets/art/cypress-tree.png',
      tileX: 0.25,
      tileY: 16,
      scale: 0.72,
      collision: { x: 30, y: 204, width: 22, height: 26 }
    },
    {
      id: 'flowering-tree-east',
      key: 'iso-flowering-tree',
      path: 'assets/art/flowering-tree.png',
      tileX: 19,
      tileY: 6,
      scale: 0.72,
      collision: { x: 80, y: 201, width: 47, height: 29 }
    },
    {
      id: 'flowering-hedge-west',
      key: 'iso-flowering-hedge',
      path: 'assets/art/flowering-hedge-straight.png',
      tileX: 10.5,
      tileY: 18.5,
      scale: 0.46,
      collision: { x: 14, y: 145, width: 211, height: 27 }
    },
    {
      id: 'flowering-hedge-east',
      key: 'iso-flowering-hedge',
      path: 'assets/art/flowering-hedge-straight.png',
      tileX: 20,
      tileY: 9,
      scale: 0.43,
      collision: { x: 14, y: 145, width: 211, height: 27 }
    },
    {
      id: 'flowering-hedge-corner-west',
      key: 'iso-flowering-hedge-corner',
      path: 'assets/art/flowering-hedge-corner.png',
      tileX: 3,
      tileY: 19,
      scale: 0.48,
      collision: { x: 20, y: 109, width: 185, height: 25 }
    },
    {
      id: 'flowering-hedge-end-east',
      key: 'iso-flowering-hedge-end',
      path: 'assets/art/flowering-hedge-end.png',
      tileX: 22,
      tileY: 6,
      scale: 0.5,
      collision: { x: 12, y: 127, width: 111, height: 26 }
    },
    {
      id: 'flowering-bush-south',
      key: 'iso-flowering-bush',
      path: 'assets/art/flowering-bush-round.png',
      tileX: 5,
      tileY: 21,
      scale: 0.54,
      collision: { x: 39, y: 116, width: 78, height: 27 }
    },
    {
      id: 'rose-arch-west',
      key: 'iso-rose-arch',
      path: 'assets/art/rose-arch.png',
      tileX: 8,
      tileY: 13,
      scale: 0.58,
      collision: [
        { x: 9, y: 175, width: 35, height: 40 },
        { x: 133, y: 175, width: 35, height: 40 }
      ]
    },
    {
      id: 'rose-arch-east',
      key: 'iso-rose-arch',
      path: 'assets/art/rose-arch.png',
      tileX: 14,
      tileY: 7,
      scale: 0.58,
      collision: [
        { x: 9, y: 175, width: 35, height: 40 },
        { x: 133, y: 175, width: 35, height: 40 }
      ]
    },
    {
      id: 'rose-trellis-east',
      key: 'iso-rose-trellis',
      path: 'assets/art/rose-trellis.png',
      tileX: 19,
      tileY: 12,
      scale: 0.56,
      collision: [
        { x: 19, y: 187, width: 37, height: 40 },
        { x: 145, y: 187, width: 37, height: 40 }
      ]
    },
    {
      id: 'rose-pillar-south',
      key: 'iso-rose-pillar',
      path: 'assets/art/rose-pillar.png',
      tileX: 23,
      tileY: 8,
      scale: 0.55,
      collision: { x: 33, y: 185, width: 42, height: 32 }
    },
    {
      id: 'academy-rose-urn-east',
      key: 'iso-rose-urn',
      path: 'assets/art/rose-urn.png',
      tileX: 24,
      tileY: 11,
      scale: 0.5,
      collision: { x: 44, y: 164, width: 61, height: 29 }
    },
    {
      id: 'flower-bed-west',
      key: 'iso-flower-bed',
      path: 'assets/art/flower-bed.png',
      tileX: 13,
      tileY: 20,
      scale: 0.48,
      collision: { x: 50, y: 120, width: 145, height: 25 }
    },
    {
      id: 'flower-bed-east',
      key: 'iso-flower-bed',
      path: 'assets/art/flower-bed.png',
      tileX: 22,
      tileY: 11,
      scale: 0.48,
      collision: { x: 50, y: 120, width: 145, height: 25 }
    },
    {
      id: 'garden-lantern-west',
      key: 'iso-garden-lantern',
      path: 'assets/art/garden-lantern.png',
      tileX: 11,
      tileY: 15,
      scale: 0.48,
      collision: { x: 27, y: 210, width: 42, height: 23 }
    },
    {
      id: 'garden-lantern-east',
      key: 'iso-garden-lantern',
      path: 'assets/art/garden-lantern.png',
      tileX: 16,
      tileY: 10,
      scale: 0.48,
      collision: { x: 27, y: 210, width: 42, height: 23 }
    },
    {
      id: 'garden-bench-west',
      key: 'iso-garden-bench',
      path: 'assets/art/garden-bench.png',
      tileX: 10,
      tileY: 22,
      scale: 0.56,
      collision: { x: 38, y: 116, width: 125, height: 38 }
    },
    {
      id: 'garden-bench-east',
      key: 'iso-garden-bench',
      path: 'assets/art/garden-bench.png',
      tileX: 27,
      tileY: 13,
      scale: 0.56,
      collision: { x: 38, y: 116, width: 125, height: 38 }
    },
    {
      id: 'planter-west',
      key: 'iso-planter-box',
      path: 'assets/art/planter-box.png',
      tileX: 12,
      tileY: 20,
      scale: 0.5,
      collision: { x: 25, y: 99, width: 136, height: 34 }
    },
    {
      id: 'planter-east',
      key: 'iso-planter-box',
      path: 'assets/art/planter-box.png',
      tileX: 23,
      tileY: 6,
      scale: 0.5,
      collision: { x: 25, y: 99, width: 136, height: 34 }
    },
    {
      id: 'academy-statue-south-east',
      key: 'iso-academy-statue',
      path: 'assets/art/academy-statue.png',
      tileX: 24,
      tileY: 5,
      scale: 0.58,
      collision: { x: 12, y: 177, width: 99, height: 29 }
    },
    {
      id: 'topiary-urn-east',
      key: 'iso-topiary-urn',
      path: 'assets/art/topiary-urn.png',
      tileX: 26,
      tileY: 8.5,
      scale: 0.58,
      collision: { x: 24, y: 158, width: 52, height: 26 }
    },
    {
      id: 'stone-rail-west',
      key: 'iso-stone-rail',
      path: 'assets/art/stone-rail.png',
      tileX: 16,
      tileY: 21,
      scale: 0.45,
      collision: { x: 17, y: 172, width: 194, height: 28 }
    },
    {
      id: 'cobblestone-courtyard-inlay',
      key: 'iso-cobblestone-inlay',
      path: 'assets/art/academy-cobblestone-inlay.png',
      tileX: 14,
      tileY: 12,
      scale: 0.72
    }
  ],
  fountain: [{
    key: 'iso-fountain',
    path: 'assets/art/fountain.png',
    tileX: 14,
    tileY: 12,
    scale: 0.62,
    originY: 0.87,
    collision: {
      x: 4,
      y: 145,
      width: 204,
      height: 54
    }
  }],
  foreground: []
};

function loadIsometricAssets(scene) {
  const loadedKeys = new Set();

  for (const assets of Object.values(ISO_ASSET_MANIFEST)) {
    for (const { key, path } of assets) {
      if (loadedKeys.has(key)) continue;
      scene.load.image(key, path);
      loadedKeys.add(key);
    }
  }
}

function isoTileToWorld(tileX, tileY) {
  return {
    x: ISO_ORIGIN_X + (tileX - tileY) * ISO_TILE_WIDTH / 2,
    y: ISO_ORIGIN_Y + (tileX + tileY) * ISO_TILE_HEIGHT / 2
  };
}

function isoWorldToTile(worldX, worldY) {
  const relativeX = (worldX - ISO_ORIGIN_X) / (ISO_TILE_WIDTH / 2);
  const relativeY = (worldY - ISO_ORIGIN_Y) / (ISO_TILE_HEIGHT / 2);

  return {
    x: (relativeX + relativeY) / 2,
    y: (relativeY - relativeX) / 2
  };
}

class IsometricCourtyardScene extends Phaser.Scene {
  constructor() {
    super('IsometricCourtyard');
  }

  preload() {
    loadIsometricAssets(this);
    this.load.image(
      'iso-purple-butterfly',
      'assets/art/purple-butterfly.png'
    );
    this.load.svg('kauai', 'assets/kauai.svg', {
      width: 48,
      height: 64
    });

  }

  create(data = {}) {
    createOmarAnimations(this);
    this.cameras.main.setBackgroundColor('#68b8f5');
    this.physics.world.setBounds(
      ISO_WORLD_BOUNDS.x,
      ISO_WORLD_BOUNDS.y,
      ISO_WORLD_BOUNDS.width,
      ISO_WORLD_BOUNDS.height
    );

    this.renderLayers = {
      ground: [],
      structures: [],
      decorations: [],
      fountain: [],
      characters: [],
      foreground: []
    };
    this.manifestSprites = new Map();
    this.collisionDebugObjects = [];
    this.depthSortActors = true;
    this.npcs = [];
    this.dialogueActive = false;
    this.transitioning = false;
    this.reducedMotion = typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const debugParameters = new URLSearchParams(window.location.search);
    this.debugStairs =
      debugParameters.get('scene') === 'isometric' &&
      debugParameters.get('debugStairs') === '1';
    this.debugCollision =
      debugParameters.get('debugCollision') === '1' || this.debugStairs;
    this.lastMovementBlockLog = new Map();
    this.movementIntent = { x: 0, y: 0 };
    this.stairwayRegion = 'courtyard';
    this.fountainAsset = ISO_ASSET_MANIFEST.fountain[0];
    const entrance = isoTileToWorld(
      ISO_CASTLE_ENTRANCE_TILE.x,
      ISO_CASTLE_ENTRANCE_TILE.y
    );
    this.castleDoorAnchor = entrance;
    this.drawParallaxBackdrop();
    this.drawGroundLayer();
    this.drawStructureLayer();
    const upperLanding = getStairwayPoint(1, this.staircaseSprite);
    this.castleEntrance = {
      x: upperLanding.x,
      y: upperLanding.y,
      radius: 20
    };
    this.drawFountain(ISO_FOUNTAIN_TILE);

    const spawn = data.spawn || isoTileToWorld(
      ISO_PLAYER_SPAWN_TILE.x,
      ISO_PLAYER_SPAWN_TILE.y
    );
    this.knight = createKnight(this, spawn.x, spawn.y);
    this.knight.setCollideWorldBounds(true);
    const spawnStairwayPosition = getStairwayProgress(
      this.knight.body.center.x,
      this.knight.body.bottom,
      this.staircaseSprite
    );
    if (spawnStairwayPosition.distance <= ISO_STAIRWAY_HALF_WIDTH + 12) {
      this.knight.setDepth(
        Math.max(
          this.knight.body.bottom,
          this.staircaseSprite.depth + 1
        )
      );
      this.stairwayRegion = spawnStairwayPosition.progress >= 1
        ? 'upper-landing'
        : spawnStairwayPosition.progress < 0
          ? 'lower-approach'
          : 'stair-run';
    }
    this.renderLayers.characters.push(this.knight);
    this.createCollisionLayer();
    this.fountainCollider = this.physics.add.collider(
      this.knight,
      this.fountainBody,
      (actor, blocker) => this.logMovementRejected(actor, blocker)
    );
    this.createStaticCollisionLayer();
    this.interactionPrompt = createInteractionPrompt(this);

    if (this.debugCollision) {
      this.drawStairwayDebug();
    }

    this.drawForegroundLayer();
    this.createGardenButterflies();
    if (this.debugStairs) {
      this.drawStairwayActorDebug();
      console.debug('[stairs] Sprite and navigation coordinates', {
        sprite: {
          x: this.staircaseSprite.x,
          y: this.staircaseSprite.y,
          originX: this.staircaseSprite.originX,
          originY: this.staircaseSprite.originY,
          displayWidth: this.staircaseSprite.displayWidth,
          displayHeight: this.staircaseSprite.displayHeight,
          depth: this.staircaseSprite.depth
        },
        lowerStep: getStairwayPoint(0, this.staircaseSprite),
        upperLanding: upperLanding,
        entranceTile: ISO_CASTLE_ENTRANCE_TILE,
        entranceWorld: entrance,
        entranceTileRoundTrip: isoWorldToTile(entrance.x, entrance.y)
      });
    }
    this.add.text(16, 52, 'EXPERIMENTAL ISOMETRIC COURTYARD  |  WASD / ARROWS', {
      fontFamily: 'Georgia',
      fontSize: '14px',
      color: '#fff0d7',
      backgroundColor: '#202536',
      padding: { x: 8, y: 5 }
    }).setScrollFactor(0).setDepth(10000);

    this.cameras.main.setBounds(
      ISO_WORLD_BOUNDS.x,
      ISO_WORLD_BOUNDS.y,
      ISO_WORLD_BOUNDS.width,
      ISO_WORLD_BOUNDS.height
    );
    this.cameras.main.centerOn(this.knight.x, this.knight.y);
    this.cameras.main.startFollow(this.knight, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  addLayerObject(layer, gameObject, depth) {
    gameObject.setDepth(depth);
    this.renderLayers[layer].push(gameObject);
    return gameObject;
  }

  drawParallaxBackdrop() {
    const mountainHaze = this.add.graphics();
    mountainHaze.fillStyle(0xc5e5f7, 0.56);
    mountainHaze.fillPoints([
      { x: -300, y: 335 },
      { x: 80, y: 180 },
      { x: 260, y: 285 },
      { x: 510, y: 155 },
      { x: 760, y: 300 },
      { x: 1030, y: 175 },
      { x: 1270, y: 310 },
      { x: 1540, y: 165 },
      { x: 1800, y: 295 },
      { x: 2070, y: 185 },
      { x: 2490, y: 340 },
      { x: 2490, y: 430 },
      { x: -300, y: 430 }
    ], true);
    mountainHaze.setScrollFactor(0.025, 0).setDepth(-2000);

    const mountains = this.add.graphics();
    mountains.fillStyle(0x6e9cbd, 0.62);
    mountains.fillPoints([
      { x: -300, y: 405 },
      { x: 20, y: 270 },
      { x: 185, y: 345 },
      { x: 380, y: 205 },
      { x: 560, y: 355 },
      { x: 805, y: 225 },
      { x: 1010, y: 358 },
      { x: 1240, y: 215 },
      { x: 1460, y: 355 },
      { x: 1695, y: 230 },
      { x: 1910, y: 372 },
      { x: 2160, y: 225 },
      { x: 2490, y: 410 },
      { x: 2490, y: 440 },
      { x: -300, y: 440 }
    ], true);
    mountains.fillStyle(0x91b5ca, 0.55);
    for (const peak of [
      { x: 20, y: 270, w: 92, h: 68 },
      { x: 380, y: 205, w: 112, h: 82 },
      { x: 805, y: 225, w: 100, h: 76 },
      { x: 1240, y: 215, w: 108, h: 82 },
      { x: 1695, y: 230, w: 116, h: 86 },
      { x: 2160, y: 225, w: 100, h: 78 }
    ]) {
      mountains.fillPoints([
        { x: peak.x - peak.w / 2, y: peak.y + peak.h },
        { x: peak.x, y: peak.y },
        { x: peak.x + peak.w / 2, y: peak.y + peak.h }
      ], true);
    }
    mountains.setScrollFactor(0.045, 0).setDepth(-1999);

    const forest = this.add.graphics();
    forest.fillStyle(0x426f6c, 0.72);
    for (let x = -180; x < ISO_WORLD_MAX_X + 320; x += 48) {
      const height = 42 + ((Math.floor((x + 180) / 48) * 17) % 31);
      forest.fillPoints([
        { x, y: 390 },
        { x: x + 20, y: 390 - height },
        { x: x + 40, y: 390 }
      ], true);
      forest.fillRect(x + 17, 381 - height * 0.35, 6, height * 0.35 + 12);
    }
    forest.setScrollFactor(0.08, 0).setDepth(-1998);

    const sunlight = this.add.graphics();
    sunlight.fillStyle(0xffe7a5, 0.12);
    sunlight.fillCircle(130, 75, 185);
    sunlight.fillStyle(0xfff1c9, 0.22);
    sunlight.fillCircle(130, 75, 82);
    sunlight.fillStyle(0xffe7a5, 0.045);
    for (const ray of [
      [{ x: 80, y: 70 }, { x: 315, y: 500 }, { x: 405, y: 500 }],
      [{ x: 115, y: 55 }, { x: 690, y: 430 }, { x: 790, y: 430 }],
      [{ x: 145, y: 50 }, { x: 1050, y: 345 }, { x: 1160, y: 345 }]
    ]) {
      sunlight.fillPoints(ray, true);
    }
    sunlight.setScrollFactor(0).setDepth(-1997);

    const clouds = this.add.graphics();
    for (const cloud of [
      { x: 190, y: 138, scale: 0.72 },
      { x: 480, y: 78, scale: 0.52 },
      { x: 790, y: 155, scale: 0.88 },
      { x: 1120, y: 96, scale: 0.64 },
      { x: 1450, y: 158, scale: 0.76 },
      { x: 1780, y: 82, scale: 0.56 },
      { x: 2110, y: 145, scale: 0.92 }
    ]) {
      const { x, y, scale } = cloud;
      clouds.fillStyle(0x8db7d4, 0.12);
      clouds.fillEllipse(x, y + 13 * scale, 190 * scale, 44 * scale);
      clouds.fillStyle(0xffffff, 0.76);
      clouds.fillCircle(x - 42 * scale, y, 27 * scale);
      clouds.fillCircle(x - 12 * scale, y - 13 * scale, 36 * scale);
      clouds.fillCircle(x + 28 * scale, y - 7 * scale, 32 * scale);
      clouds.fillCircle(x + 54 * scale, y + 4 * scale, 22 * scale);
      clouds.fillEllipse(x + 5 * scale, y + 10 * scale, 118 * scale, 25 * scale);
      clouds.fillStyle(0xffffff, 0.38);
      clouds.fillCircle(x - 24 * scale, y - 18 * scale, 14 * scale);
    }
    clouds.setScrollFactor(0).setDepth(-1996);
  }

  addSoftShadow(x, y, width, depth, alpha = 0.14) {
    const shadow = this.add.graphics();
    shadow.fillStyle(0x263b45, alpha);
    shadow.fillEllipse(x, y, width, Math.max(7, width * 0.12));
    shadow.setDepth(depth);
    return shadow;
  }

  addIsometricSprite(layer, textureKey, tileX, tileY, options = {}) {
    const position = isoTileToWorld(tileX, tileY);
    const sprite = this.add.image(position.x, position.y, textureKey)
      .setOrigin(options.originX ?? 0.5, options.originY ?? 1)
      .setScale(options.scale ?? 1);
    return this.addLayerObject(
      layer,
      sprite,
      position.y + (options.depthOffset ?? 0)
    );
  }

  addCollisionDebug(body) {
    if (!this.debugCollision) return null;

    const { x, y, width, height } = body.body;
    const reason = body.getData('blockReason');
    const debug = this.add.graphics();
    debug.fillStyle(reason === 'staircase railing' ? 0xff4c4c : 0xff2020, 0.32);
    debug.fillRect(x, y, width, height);
    debug.lineStyle(2, reason === 'staircase railing' ? 0xffe070 : 0xff3030, 1);
    debug.strokeRect(x, y, width, height);
    debug.setDepth(10000);
    this.collisionDebugObjects.push(debug);
    return debug;
  }

  addStaticCollision(x, y, width, height, reason = 'solid obstacle') {
    const body = this.add.zone(x, y, width, height);
    body.setData('blockReason', reason);
    this.physics.add.existing(body, true);
    this.staticCollisionBodies.push(body);
    this.staticColliders.push(this.physics.add.collider(
      this.knight,
      body,
      (actor, blocker) => this.logMovementRejected(actor, blocker)
    ));

    const debug = this.addCollisionDebug(body);
    if (debug) this.staticCollisionDebug.push(debug);
    return body;
  }

  drawGroundLayer() {
    const ground = this.add.graphics();
    const pavingAsset = ISO_ASSET_MANIFEST.ground[0];
    const grassAsset = ISO_ASSET_MANIFEST.ground[1];
    const pathColor = 0xa99e8d;
    const grassColor = 0x5b7d56;
    const grassTints = [
      0xffffff,
      0xf3f8df,
      0xe7f0d1,
      0xf8efd5
    ];

    for (let tileY = ISO_TERRAIN_MIN_Y;
      tileY <= ISO_TERRAIN_MAX_Y;
      tileY++) {
      for (let tileX = ISO_TERRAIN_MIN_X;
        tileX <= ISO_TERRAIN_MAX_X;
        tileX++) {
        const center = isoTileToWorld(tileX, tileY);
        const isPath = isIsoPavedTile(tileX, tileY);
        if (tileX + tileY < ISO_TERRAIN_HORIZON_TILE_SUM && !isPath) {
          continue;
        }
        const color = isPath ? pathColor : grassColor;
        const variation = Math.abs(
          Math.sin(tileX * 127.1 + tileY * 311.7) * 43758.5453
        ) % 1;
        const points = [
          { x: center.x, y: center.y - ISO_TILE_HEIGHT / 2 },
          { x: center.x + ISO_TILE_WIDTH / 2, y: center.y },
          { x: center.x, y: center.y + ISO_TILE_HEIGHT / 2 },
          { x: center.x - ISO_TILE_WIDTH / 2, y: center.y }
        ];

        ground.fillStyle(color, 1);
        ground.fillPoints(points, true);
        const grass = this.add.image(center.x, center.y, grassAsset.key)
          .setOrigin(0.5)
          .setScale(0.84)
          .setTint(grassTints[Math.floor(variation * grassTints.length)]);
        this.addLayerObject(
          'ground',
          grass,
          -1000 + (tileX + tileY) * 0.01
        );

        if (isPath) {
          ground.lineStyle(1, 0x8c8278, 0.3);
          ground.strokePoints(points, true);
        }

        if (isPath) {
          const paving = this.add.image(
            center.x,
            center.y,
            pavingAsset.key
          ).setOrigin(0.5).setScale(1);
          this.addLayerObject(
            'ground',
            paving,
            -900 + (tileX + tileY) * 0.01
          );
        }
      }
    }

    this.addLayerObject('ground', ground, -1100);
    this.addWildflowerPatches();
  }

  addWildflowerPatches() {
    const floweringBushKey = 'iso-flowering-bush';

    for (let tileY = ISO_TERRAIN_MIN_Y; tileY <= ISO_TERRAIN_MAX_Y; tileY++) {
      for (let tileX = ISO_TERRAIN_MIN_X; tileX <= ISO_TERRAIN_MAX_X; tileX++) {
        const outsideCourtyard =
          tileX < 0 ||
          tileX >= ISO_MAP_COLUMNS ||
          tileY < 0 ||
          tileY >= ISO_MAP_ROWS;
        if (!outsideCourtyard) continue;

        const variation = Math.abs(
          Math.sin(tileX * 269.5 + tileY * 183.3) * 15631.743
        ) % 1;
        if (variation > 0.035) continue;

        const position = isoTileToWorld(tileX, tileY);
        const flower = this.add.image(
          position.x,
          position.y,
          floweringBushKey
        )
          .setOrigin(0.5, 1)
          .setScale(0.24 + variation * 0.5);
        this.addLayerObject('decorations', flower, position.y + 1);
      }
    }
  }

  drawStructureLayer() {
    this.drawAcademyCastle();
    this.addManifestSprites('structures', ISO_ASSET_MANIFEST.buildings);
    this.addManifestSprites('decorations', ISO_ASSET_MANIFEST.decorations);
  }

  drawAcademyCastle() {
    const { x: entranceX, y: entranceY } = this.castleDoorAnchor;

    for (const asset of ISO_ASSET_MANIFEST.castle) {
      const sprite = this.add.image(
        entranceX + asset.offsetX,
        entranceY + asset.offsetY,
        asset.key
      )
        .setOrigin(0.5, 1)
        .setScale(asset.scale);
      if (asset.flipX) sprite.setFlipX(true);
      if (asset.id === 'castle-grand-staircase') {
        this.staircaseSprite = sprite;
      }
      if (asset.id.includes('tower')) {
        this.addSoftShadow(
          sprite.x,
          sprite.y - 2,
          Math.min(sprite.displayWidth * 0.72, 96),
          sprite.y - 0.5,
          0.13
        );
      }
      this.addLayerObject(
        'structures',
        sprite,
        sprite.y + (asset.depthOffset ?? 0)
      );
    }
  }

  drawStairwayDebug() {
    const graphics = this.add.graphics();
    const corridorSides = [[], []];
    const centerline = [];
    const pathSamples = 48;

    for (let index = 0; index <= pathSamples; index++) {
      const progress = ISO_STAIRWAY_APPROACH_PROGRESS +
        (ISO_STAIRWAY_EXIT_PROGRESS - ISO_STAIRWAY_APPROACH_PROGRESS) *
          index / pathSamples;
      const point = getStairwayPoint(progress, this.staircaseSprite);
      const { direction } = getStairwayProgress(
        point.x,
        point.y,
        this.staircaseSprite
      );
      const normalX = -direction.y;
      const normalY = direction.x;
      centerline.push(point);
      corridorSides[0].push({
        x: point.x + normalX * ISO_STAIRWAY_HALF_WIDTH,
        y: point.y + normalY * ISO_STAIRWAY_HALF_WIDTH
      });
      corridorSides[1].push({
        x: point.x - normalX * ISO_STAIRWAY_HALF_WIDTH,
        y: point.y - normalY * ISO_STAIRWAY_HALF_WIDTH
      });
    }

    graphics.fillStyle(0x50ffbd, 0.16);
    graphics.fillPoints([
      ...corridorSides[0],
      ...corridorSides[1].reverse()
    ], true);
    graphics.lineStyle(2, 0x50ffbd, 0.9);
    for (const side of corridorSides) {
      for (let index = 1; index < side.length; index++) {
        graphics.lineBetween(
          side[index - 1].x,
          side[index - 1].y,
          side[index].x,
          side[index].y
        );
      }
    }
    graphics.lineStyle(1, 0x50ffbd, 0.7);
    for (let index = 1; index < centerline.length; index++) {
      graphics.lineBetween(
        centerline[index - 1].x,
        centerline[index - 1].y,
        centerline[index].x,
        centerline[index].y
      );
    }
    graphics.lineStyle(1, 0xffda74, 0.95);
    graphics.strokeCircle(
      this.castleEntrance.x,
      this.castleEntrance.y,
      this.castleEntrance.radius
    );
    graphics.setDepth(10001);
    this.collisionDebugObjects.push(graphics);
  }

  drawStairwayActorDebug() {
    this.stairwayActorDebug = this.add.graphics().setDepth(10002);
    this.stairwayDebugReadout = this.add.text(16, 76, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#b9f5ff',
      backgroundColor: '#202536',
      padding: { x: 6, y: 4 }
    }).setScrollFactor(0).setDepth(10002);
    this.updateStairwayActorDebug();
  }

  updateStairwayActorDebug() {
    if (!this.stairwayActorDebug || !this.knight.body) return;

    const { x, y, width, height } = this.knight.body;
    const logicalX = this.knight.body.center.x;
    const logicalY = this.knight.body.bottom;
    const visualFootY = this.knight.y +
      this.knight.displayHeight * this.knight.originY;
    this.stairwayActorDebug.clear();
    this.stairwayActorDebug.lineStyle(2, 0x54e8ff, 1);
    this.stairwayActorDebug.strokeRect(x, y, width, height);
    this.stairwayActorDebug.lineStyle(1, 0xffda74, 0.9);
    this.stairwayActorDebug.lineBetween(
      this.knight.x,
      visualFootY,
      logicalX,
      logicalY
    );
    this.stairwayActorDebug.fillStyle(0x54e8ff, 0.85);
    this.stairwayActorDebug.fillCircle(logicalX, logicalY, 3);
    this.stairwayActorDebug.fillStyle(0xffda74, 0.85);
    this.stairwayActorDebug.fillCircle(this.knight.x, visualFootY, 3);

    const stairwayPosition = getStairwayProgress(
      logicalX,
      logicalY,
      this.staircaseSprite
    );
    this.stairwayDebugReadout.setText([
      `Region: ${this.stairwayRegion}`,
      `Progress: ${stairwayPosition.progress.toFixed(2)}`,
      `Logical: ${logicalX.toFixed(1)}, ${logicalY.toFixed(1)}`,
      `Visual: ${this.knight.x.toFixed(1)}, ${visualFootY.toFixed(1)}`
    ]);
  }

  logMovementRejected(actor, blocker) {
    if (!this.debugStairs ||
        (!this.movementIntent.x && !this.movementIntent.y)) return;

    const reason = blocker.getData('blockReason') || 'solid obstacle';
    const now = this.time.now;
    if (now - (this.lastMovementBlockLog.get(reason) ?? -Infinity) < 500) return;

    this.lastMovementBlockLog.set(reason, now);
    console.debug(`[stairs] Movement blocked by ${reason}`, {
      position: { x: actor.x, y: actor.y },
      collision: { x: actor.body.x, y: actor.body.y },
      requestedVelocity: this.movementIntent
    });
  }

  drawFountain(tile) {
    const asset = ISO_ASSET_MANIFEST.fountain[0];
    const fountain = this.addIsometricSprite(
      'fountain',
      asset.key,
      tile.x,
      tile.y,
      asset
    );
    this.fountain = fountain;
    fountain.setDepth(fountain.y);

    const reflection = this.add.graphics();
    reflection.fillStyle(0xd8f4ff, 0.2);
    reflection.fillEllipse(
      fountain.x - fountain.displayWidth * 0.22,
      fountain.y - fountain.displayHeight * 0.16,
      fountain.displayWidth * 0.11,
      fountain.displayHeight * 0.025
    );
    reflection.fillStyle(0xffffff, 0.14);
    reflection.fillEllipse(
      fountain.x + fountain.displayWidth * 0.2,
      fountain.y - fountain.displayHeight * 0.13,
      fountain.displayWidth * 0.075,
      fountain.displayHeight * 0.018
    );
    reflection.setDepth(fountain.depth + 0.2);
  }

  addManifestSprites(layer, assets, fixedDepth) {
    for (const asset of assets) {
      const position = isoTileToWorld(asset.tileX, asset.tileY);
      const sprite = this.addIsometricSprite(
        layer,
        asset.key,
        asset.tileX,
        asset.tileY,
        asset
      );
      this.manifestSprites.set(asset.id ?? asset.key, sprite);
      if (fixedDepth !== undefined) sprite.setDepth(fixedDepth);
      else sprite.setDepth(position.y + (asset.depthOffset ?? 0));
      if (layer === 'decorations' && asset.collision) {
        this.addSoftShadow(
          position.x,
          position.y - 2,
          Math.min(sprite.displayWidth * 0.68, 118),
          position.y - 0.5,
          0.11
        );
      }
    }
  }

  createStaticCollisionLayer() {
    this.staticCollisionBodies = [];
    this.staticCollisionDebug = [];
    this.staticColliders = [];

    const solidAssets = [
      ...ISO_ASSET_MANIFEST.buildings,
      ...ISO_ASSET_MANIFEST.decorations,
      ...ISO_ASSET_MANIFEST.foreground
    ];

    for (const asset of solidAssets) {
      if (!asset.collision) continue;

      const sprite = this.manifestSprites.get(asset.id ?? asset.key);
      if (!sprite) {
        throw new Error(`Missing isometric collision sprite: ${asset.id ?? asset.key}`);
      }

      const scaleX = Math.abs(sprite.scaleX);
      const scaleY = Math.abs(sprite.scaleY);
      const left = sprite.x - sprite.displayWidth * sprite.originX;
      const top = sprite.y - sprite.displayHeight * sprite.originY;
      const collisionAreas = Array.isArray(asset.collision)
        ? asset.collision
        : [asset.collision];

      for (const collision of collisionAreas) {
        const x = left + (collision.x + collision.width / 2) * scaleX;
        const y = top + (collision.y + collision.height / 2) * scaleY;
        const width = collision.width * scaleX;
        const height = collision.height * scaleY;
        this.addStaticCollision(x, y, width, height, asset.id ?? asset.key);
      }
    }

    const { x: doorX, y: doorY } = this.castleDoorAnchor;
    for (const side of [-1, 1]) {
      this.addStaticCollision(
        doorX + side * 350,
        doorY + 1,
        510,
        20,
        'castle wall'
      );
      this.addStaticCollision(
        doorX + side * 84,
        doorY + 38,
        12,
        52,
        'doorway side wall'
      );
      this.addStaticCollision(
        doorX + side * 410,
        doorY - 10,
        74,
        28,
        'castle wall return'
      );
      this.addStaticCollision(
        doorX + side * 610,
        doorY + 3,
        110,
        40,
        'castle tower'
      );
    }

    const lower = getStairwayPoint(
      ISO_STAIRWAY_APPROACH_PROGRESS,
      this.staircaseSprite
    );
    const upper = getStairwayPoint(
      ISO_STAIRWAY_EXIT_PROGRESS,
      this.staircaseSprite
    );
    const pathX = upper.x - lower.x;
    const pathY = upper.y - lower.y;
    const length = Math.hypot(pathX, pathY);
    const railSegments = Math.ceil(length / 8);

    for (let step = 0; step <= railSegments; step++) {
      const progress = ISO_STAIRWAY_APPROACH_PROGRESS +
        (ISO_STAIRWAY_EXIT_PROGRESS - ISO_STAIRWAY_APPROACH_PROGRESS) *
          step / railSegments;
      const point = getStairwayPoint(progress, this.staircaseSprite);
      const { direction } = getStairwayProgress(
        point.x,
        point.y,
        this.staircaseSprite
      );
      const normalX = -direction.y;
      const normalY = direction.x;
      for (const side of [-1, 1]) {
        this.addStaticCollision(
          point.x + side * normalX * ISO_STAIRWAY_RAIL_OFFSET,
          point.y + side * normalY * ISO_STAIRWAY_RAIL_OFFSET,
          12,
          12,
          'staircase railing'
        );
      }
    }
  }

  createCollisionLayer() {
    const { collision } = this.fountainAsset;
    const scaleX = Math.abs(this.fountain.scaleX);
    const scaleY = Math.abs(this.fountain.scaleY);
    const left = this.fountain.x - this.fountain.displayWidth * this.fountain.originX;
    const top = this.fountain.y - this.fountain.displayHeight * this.fountain.originY;
    const x = left + (collision.x + collision.width / 2) * scaleX;
    const y = top + (collision.y + collision.height / 2) * scaleY;
    const width = collision.width * scaleX;
    const height = collision.height * scaleY;

    this.fountainBody = this.add.zone(x, y, width, height);
    this.fountainBody.setData('blockReason', 'fountain');
    this.physics.add.existing(this.fountainBody, true);
    this.fountainCollisionDebug = this.addCollisionDebug(this.fountainBody);
  }

  drawForegroundLayer() {
    this.addManifestSprites('foreground', ISO_ASSET_MANIFEST.foreground);
  }

  createGardenButterflies() {
    const floralAssetPattern =
      /rose-bush|ornamental-tree|flowering-tree|flowering-hedge|flowering-bush|flower-bed/;
    const perches = ISO_ASSET_MANIFEST.decorations
      .filter(asset => floralAssetPattern.test(asset.id))
      .flatMap(asset => {
        const sprite = this.manifestSprites.get(asset.id);
        if (!sprite) {
          throw new Error(`Missing butterfly garden perch: ${asset.id}`);
        }

        const horizontalSpread = Math.min(sprite.displayWidth * 0.2, 24);
        const y = sprite.y - sprite.displayHeight * 0.62;
        const garden = sprite.x < ISO_ORIGIN_X ? 'west' : 'east';
        return [-1, 1].map(direction => ({
          x: sprite.x + horizontalSpread * direction,
          y,
          garden
        }));
      });
    const gardenPerches = {
      west: perches.filter(perch => perch.garden === 'west'),
      east: perches.filter(perch => perch.garden === 'east')
    };
    const butterflyCount = Math.min(
      8,
      gardenPerches.west.length + gardenPerches.east.length
    );

    this.gardenButterflies = Array.from(
      { length: butterflyCount },
      (_, index) => {
        const garden = index % 2 === 0 ? 'west' : 'east';
        const choices = gardenPerches[garden];
        const perch = choices[Math.floor(Math.random() * choices.length)];
        const scale = 0.38 + Math.random() * 0.08;
        const sprite = this.add.image(
          perch.x,
          perch.y,
          'iso-purple-butterfly'
        ).setOrigin(0.5, 0.5).setScale(scale);
        if (index % 3 === 0) sprite.setTint(0xfff0ff);
        sprite.setDepth(perch.y + 1);

        return {
          sprite,
          garden,
          scale,
          flapSpeed: 0.006 + Math.random() * 0.004,
          flapPhase: Math.random() * Math.PI * 2,
          state: 'landed',
          elapsed: 0,
          duration: 0,
          idleDuration: 500 + Math.random() * 1800,
          start: { x: perch.x, y: perch.y },
          control: { x: perch.x, y: perch.y },
          target: { x: perch.x, y: perch.y }
        };
      }
    );
    this.butterflyPerches = gardenPerches;
  }

  startGardenButterflyFlight(butterfly) {
    const choices = this.butterflyPerches[butterfly.garden];
    const nearbyPerches = choices.filter(perch => {
      const distance = Phaser.Math.Distance.Between(
        butterfly.sprite.x,
        butterfly.sprite.y,
        perch.x,
        perch.y
      );
      return distance >= 28 && distance <= 185;
    });
    const target = nearbyPerches.length
      ? nearbyPerches[Math.floor(Math.random() * nearbyPerches.length)]
      : choices[Math.floor(Math.random() * choices.length)];
    const start = { x: butterfly.sprite.x, y: butterfly.sprite.y };
    const deltaX = target.x - start.x;
    const deltaY = target.y - start.y;
    const distance = Math.hypot(deltaX, deltaY) || 1;
    const curve = (Math.random() - 0.5) * Math.min(distance * 0.45, 38);

    butterfly.state = 'flying';
    butterfly.elapsed = 0;
    butterfly.duration = 1700 + Math.random() * 2200;
    butterfly.start = start;
    butterfly.target = { x: target.x, y: target.y };
    butterfly.control = {
      x: (start.x + target.x) / 2 - deltaY / distance * curve,
      y: (start.y + target.y) / 2 + deltaX / distance * curve
    };
  }

  updateGardenButterflies(time, delta) {
    if (!this.gardenButterflies || this.reducedMotion) return;

    for (const butterfly of this.gardenButterflies) {
      if (butterfly.state === 'landed') {
        butterfly.idleDuration -= delta;
        butterfly.sprite.setScale(butterfly.scale, butterfly.scale * 0.58);
        if (butterfly.idleDuration <= 0) {
          this.startGardenButterflyFlight(butterfly);
        }
      } else {
        butterfly.elapsed += delta;
        const progress = Math.min(
          butterfly.elapsed / butterfly.duration,
          1
        );
        const inverseProgress = 1 - progress;
        const { start, control, target } = butterfly;
        butterfly.sprite.setPosition(
          inverseProgress ** 2 * start.x +
            2 * inverseProgress * progress * control.x +
            progress ** 2 * target.x,
          inverseProgress ** 2 * start.y +
            2 * inverseProgress * progress * control.y +
            progress ** 2 * target.y
        );
        const flap = 0.48 + 0.52 *
          Math.abs(Math.sin(time * butterfly.flapSpeed + butterfly.flapPhase));
        butterfly.sprite.setScale(butterfly.scale, butterfly.scale * flap);

        if (progress >= 1) {
          butterfly.state = 'landed';
          butterfly.idleDuration = 900 + Math.random() * 2800;
          if (Math.random() < 0.32) {
            this.startGardenButterflyFlight(butterfly);
          }
        }
      }
      butterfly.sprite.setDepth(butterfly.sprite.y + 1);
    }
  }

  update(time, delta) {
    this.updateGardenButterflies(time, delta);
    if (this.transitioning || this.dialogueActive) return;

    const actorGroundPoint = {
      x: this.knight.body.center.x,
      y: this.knight.body.bottom
    };
    const entranceDistance = Phaser.Math.Distance.Between(
      actorGroundPoint.x,
      actorGroundPoint.y,
      this.castleEntrance.x,
      this.castleEntrance.y
    );
    const entranceNearby = entranceDistance < this.castleEntrance.radius;
    this.interactionPrompt
      .setText(entranceNearby ? 'Press E to enter the Royal Academy.' : '')
      .setVisible(entranceNearby);

    if (entranceNearby && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      transitionTo(this, 'AcademyInterior', {
        spawn: { x: 400, y: 375 },
        returnScene: 'IsometricCourtyard',
        returnSpawn: {
          x: this.castleEntrance.x,
          y: getStairwayPoint(0.92, this.staircaseSprite).y -
            (this.knight.body.bottom - this.knight.y)
        }
      });
      return;
    }

    updateKnightMovement(this);
    this.movementIntent = {
      x: this.knight.body.velocity.x,
      y: this.knight.body.velocity.y
    };
    actorGroundPoint.x = this.knight.body.center.x;
    actorGroundPoint.y = this.knight.body.bottom;
    let stairwayPosition = getStairwayProgress(
      actorGroundPoint.x,
      actorGroundPoint.y,
      this.staircaseSprite
    );

    let inStairwayRegion =
      stairwayPosition.progress >= ISO_STAIRWAY_APPROACH_PROGRESS &&
      stairwayPosition.progress <= ISO_STAIRWAY_EXIT_PROGRESS &&
      stairwayPosition.distance <= ISO_STAIRWAY_HALF_WIDTH + 12;
    const staircaseLeft = this.staircaseSprite.x -
      this.staircaseSprite.displayWidth * this.staircaseSprite.originX;
    const staircaseTop = this.staircaseSprite.y -
      this.staircaseSprite.displayHeight * this.staircaseSprite.originY;
    const insideStaircaseArtwork =
      actorGroundPoint.x >= staircaseLeft &&
      actorGroundPoint.x <= staircaseLeft + this.staircaseSprite.displayWidth &&
      actorGroundPoint.y >= staircaseTop &&
      actorGroundPoint.y <= this.staircaseSprite.y;

    if (insideStaircaseArtwork && !inStairwayRegion &&
        this.knight.depth < this.staircaseSprite.depth) {
      const recoveryPoint = getStairwayPoint(
        stairwayPosition.progress,
        this.staircaseSprite
      );
      const bodyGroundOffset = this.knight.body.bottom - this.knight.y;
      this.knight.setPosition(
        recoveryPoint.x,
        recoveryPoint.y - bodyGroundOffset
      );
      this.knight.body.reset(this.knight.x, this.knight.y);
      this.knight.setVelocity(0, 0);
      actorGroundPoint.x = this.knight.body.center.x;
      actorGroundPoint.y = this.knight.body.bottom;
      stairwayPosition = getStairwayProgress(
        actorGroundPoint.x,
        actorGroundPoint.y,
        this.staircaseSprite
      );
      inStairwayRegion = true;
      console.warn('[stairs] Recovered Omar from the invalid under-stair area', {
        logical: { x: actorGroundPoint.x, y: actorGroundPoint.y },
        safeProgress: stairwayPosition.progress
      });
    }

    let region = 'courtyard';
    if (inStairwayRegion) {
      if (stairwayPosition.progress < 0) region = 'lower-approach';
      else if (stairwayPosition.progress >= 1) region = 'upper-landing';
      else region = 'stair-run';
    }

    if (region !== this.stairwayRegion) {
      this.stairwayRegion = region;
      if (this.debugStairs) {
        console.debug(`[stairs] Omar entered ${region}`, {
          progress: stairwayPosition.progress,
          distanceFromPath: stairwayPosition.distance
        });
      }
    }

    if (region === 'stair-run') {
      const { direction } = stairwayPosition;
      const requestedAlongPath =
        this.movementIntent.x * direction.x +
        this.movementIntent.y * direction.y;
      const alongPath = Math.abs(requestedAlongPath) < 12
        ? 0
        : requestedAlongPath;
      this.knight.body.setVelocity(
        direction.x * alongPath,
        direction.y * alongPath
      );
      if (this.debugStairs &&
          Math.abs(requestedAlongPath) < 12 &&
          (this.movementIntent.x || this.movementIntent.y)) {
        this.logMovementRejected(this.knight, {
          getData: () => 'stairway path limits movement to the steps'
        });
      }
      if (alongPath === 0) this.knight.anims.stop();
      else {
        const facing = Math.abs(direction.x) > Math.abs(direction.y)
          ? (direction.x * alongPath < 0 ? 'left' : 'right')
          : (direction.y * alongPath < 0 ? 'up' : 'down');
        this.knight.anims.play(`walk-${facing}`, true);
      }
    }

    const depth = inStairwayRegion && this.staircaseSprite
      ? Math.max(this.knight.body.bottom, this.staircaseSprite.depth + 1)
      : this.knight.body.bottom;
    this.knight.setDepth(depth);
    this.updateStairwayActorDebug();
  }
}
