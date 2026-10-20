const ISO_TILE_WIDTH = 64;
const ISO_TILE_HEIGHT = 32;

const ISO_MAP_COLUMNS = 40;
const ISO_MAP_ROWS = 28;
const ISO_ORIGIN_X = ISO_MAP_ROWS * ISO_TILE_WIDTH / 2 + 32;
const ISO_ORIGIN_Y = 120;
const ISO_WORLD_WIDTH = ISO_ORIGIN_X + ISO_MAP_COLUMNS * ISO_TILE_WIDTH / 2 + 32;
const ISO_WORLD_HEIGHT =
  ISO_ORIGIN_Y + (ISO_MAP_COLUMNS + ISO_MAP_ROWS) * ISO_TILE_HEIGHT / 2 + 32;
const ISO_FOUNTAIN_TILE = { x: 14, y: 12 };
const ISO_PLAYER_SPAWN_TILE = { x: 9, y: 15 };
const ISO_CASTLE_ENTRANCE_TILE = { x: 10, y: 8 };
const ISO_STAIRWAY_LOWER_OFFSET_Y = 58;
const ISO_STAIRWAY_UPPER_OFFSET_Y = 18;
const ISO_STAIRWAY_UPPER_OFFSET_X = -12;
const ISO_STAIRWAY_HALF_WIDTH = 25;
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

function getStairwayPoint(progress, doorAnchor) {
  return {
    x: doorAnchor.x + ISO_STAIRWAY_UPPER_OFFSET_X * progress,
    y: doorAnchor.y + ISO_STAIRWAY_LOWER_OFFSET_Y +
      (ISO_STAIRWAY_UPPER_OFFSET_Y - ISO_STAIRWAY_LOWER_OFFSET_Y) * progress
  };
}

function getStairwayProgress(worldX, worldY, doorAnchor) {
  const lower = getStairwayPoint(0, doorAnchor);
  const upper = getStairwayPoint(1, doorAnchor);
  const pathX = upper.x - lower.x;
  const pathY = upper.y - lower.y;
  const lengthSquared = pathX ** 2 + pathY ** 2;
  const progress = Phaser.Math.Clamp(
    ((worldX - lower.x) * pathX + (worldY - lower.y) * pathY) /
      lengthSquared,
    0,
    1
  );
  const point = getStairwayPoint(progress, doorAnchor);

  return {
    progress,
    distance: Phaser.Math.Distance.Between(worldX, worldY, point.x, point.y)
  };
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
    {
      id: 'castle-roof-center',
      key: 'castle-roof-central',
      path: 'assets/art/castle-modules/roof-central-large.png',
      offsetX: 0,
      offsetY: -200,
      scale: 1.1
    },
    {
      id: 'castle-roof-left-inner',
      key: 'castle-roof-corner-left',
      path: 'assets/art/castle-modules/roof-corner-left.png',
      offsetX: -150,
      offsetY: -200,
      scale: 1
    },
    {
      id: 'castle-roof-right-inner',
      key: 'castle-roof-corner-right',
      path: 'assets/art/castle-modules/roof-corner-right.png',
      offsetX: 150,
      offsetY: -200,
      scale: 1
    },
    {
      id: 'castle-roof-left-wing',
      key: 'castle-roof-straight',
      path: 'assets/art/castle-modules/roof-straight.png',
      offsetX: -260,
      offsetY: -198,
      scale: 1
    },
    {
      id: 'castle-roof-right-wing',
      key: 'castle-roof-straight',
      path: 'assets/art/castle-modules/roof-straight.png',
      offsetX: 260,
      offsetY: -198,
      flipX: true,
      scale: 1
    },
    {
      id: 'castle-roof-left-middle',
      key: 'castle-roof-straight',
      path: 'assets/art/castle-modules/roof-straight.png',
      offsetX: -375,
      offsetY: -198,
      scale: 1
    },
    {
      id: 'castle-roof-right-middle',
      key: 'castle-roof-straight',
      path: 'assets/art/castle-modules/roof-straight.png',
      offsetX: 375,
      offsetY: -198,
      flipX: true,
      scale: 1
    },
    {
      id: 'castle-roof-left-outer',
      key: 'castle-roof-straight',
      path: 'assets/art/castle-modules/roof-straight.png',
      offsetX: -490,
      offsetY: -198,
      scale: 1
    },
    {
      id: 'castle-roof-right-outer',
      key: 'castle-roof-straight',
      path: 'assets/art/castle-modules/roof-straight.png',
      offsetX: 490,
      offsetY: -198,
      flipX: true,
      scale: 1
    },
    {
      id: 'castle-roof-left-end',
      key: 'castle-roof-end',
      path: 'assets/art/castle-modules/roof-end.png',
      offsetX: -590,
      offsetY: -198,
      scale: 1
    },
    {
      id: 'castle-roof-right-end',
      key: 'castle-roof-end',
      path: 'assets/art/castle-modules/roof-end.png',
      offsetX: 590,
      offsetY: -198,
      flipX: true,
      scale: 1
    },
    {
      id: 'castle-wall-left-inner',
      key: 'castle-wall-straight',
      path: 'assets/art/castle-modules/wall-straight.png',
      offsetX: -160,
      offsetY: 0,
      scale: 1
    },
    {
      id: 'castle-wall-right-inner',
      key: 'castle-wall-straight',
      path: 'assets/art/castle-modules/wall-straight.png',
      offsetX: 160,
      offsetY: 0,
      flipX: true,
      scale: 1
    },
    {
      id: 'castle-column-left',
      key: 'castle-wall-column',
      path: 'assets/art/castle-modules/wall-column.png',
      offsetX: -112,
      offsetY: 0,
      scale: 0.9
    },
    {
      id: 'castle-column-right',
      key: 'castle-wall-column',
      path: 'assets/art/castle-modules/wall-column.png',
      offsetX: 112,
      offsetY: 0,
      flipX: true,
      scale: 0.9
    },
    {
      id: 'castle-wall-left-window',
      key: 'castle-wall-window',
      path: 'assets/art/castle-modules/wall-window.png',
      offsetX: -260,
      offsetY: 0,
      scale: 1
    },
    {
      id: 'castle-wall-right-window',
      key: 'castle-wall-window',
      path: 'assets/art/castle-modules/wall-window.png',
      offsetX: 260,
      offsetY: 0,
      flipX: true,
      scale: 1
    },
    {
      id: 'castle-wall-left-banner',
      key: 'castle-wall-banner',
      path: 'assets/art/castle-modules/wall-banner.png',
      offsetX: -355,
      offsetY: 0,
      scale: 1
    },
    {
      id: 'castle-wall-right-banner',
      key: 'castle-wall-banner',
      path: 'assets/art/castle-modules/wall-banner.png',
      offsetX: 355,
      offsetY: 0,
      flipX: true,
      scale: 1
    },
    {
      id: 'castle-wall-left-wing',
      key: 'castle-wall-long',
      path: 'assets/art/castle-modules/wall-long.png',
      offsetX: -470,
      offsetY: 0,
      scale: 1
    },
    {
      id: 'castle-wall-right-wing',
      key: 'castle-wall-long',
      path: 'assets/art/castle-modules/wall-long.png',
      offsetX: 470,
      offsetY: 0,
      flipX: true,
      scale: 1
    },
    {
      id: 'castle-inner-tower-left',
      key: 'castle-tower-tall-spire',
      path: 'assets/art/castle-modules/tower-tall-spire.png',
      offsetX: -385,
      offsetY: -14,
      scale: 1.05
    },
    {
      id: 'castle-inner-tower-right',
      key: 'castle-tower-tall-spire',
      path: 'assets/art/castle-modules/tower-tall-spire.png',
      offsetX: 385,
      offsetY: -14,
      scale: 1.05
    },
    {
      id: 'castle-outer-tower-left',
      key: 'castle-tower-round',
      path: 'assets/art/castle-modules/tower-round.png',
      offsetX: -600,
      offsetY: 10,
      scale: 1.12
    },
    {
      id: 'castle-outer-tower-right',
      key: 'castle-tower-round',
      path: 'assets/art/castle-modules/tower-round.png',
      offsetX: 600,
      offsetY: 10,
      flipX: true,
      scale: 1.12
    },
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
    this.load.svg('kauai', 'assets/kauai.svg', {
      width: 48,
      height: 64
    });
  }

  create(data = {}) {
    createOmarAnimations(this);
    this.cameras.main.setBackgroundColor('#557653');
    this.physics.world.setBounds(0, 0, ISO_WORLD_WIDTH, ISO_WORLD_HEIGHT);

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

    this.debugCollision =
      new URLSearchParams(window.location.search).get('debugCollision') === '1';
    this.fountainAsset = ISO_ASSET_MANIFEST.fountain[0];
    const entrance = isoTileToWorld(
      ISO_CASTLE_ENTRANCE_TILE.x,
      ISO_CASTLE_ENTRANCE_TILE.y
    );
    this.castleDoorAnchor = entrance;
    this.castleEntrance = {
      x: entrance.x,
      y: entrance.y + ISO_STAIRWAY_UPPER_OFFSET_Y,
      radius: 20
    };

    this.drawGroundLayer();
    this.drawStructureLayer();
    this.drawFountain(ISO_FOUNTAIN_TILE);

    const spawn = data.spawn || isoTileToWorld(
      ISO_PLAYER_SPAWN_TILE.x,
      ISO_PLAYER_SPAWN_TILE.y
    );
    this.knight = createKnight(this, spawn.x, spawn.y);
    this.knight.setCollideWorldBounds(true);
    this.renderLayers.characters.push(this.knight);
    this.createCollisionLayer();
    this.fountainCollider = this.physics.add.collider(
      this.knight,
      this.fountainBody
    );
    this.createStaticCollisionLayer();
    this.interactionPrompt = createInteractionPrompt(this);

    if (this.debugCollision) {
      this.drawStairwayDebug();
    }

    this.drawForegroundLayer();
    this.add.text(16, 52, 'EXPERIMENTAL ISOMETRIC COURTYARD  |  WASD / ARROWS', {
      fontFamily: 'Georgia',
      fontSize: '14px',
      color: '#fff0d7',
      backgroundColor: '#202536',
      padding: { x: 8, y: 5 }
    }).setScrollFactor(0).setDepth(10000);

    this.cameras.main.setBounds(0, 0, ISO_WORLD_WIDTH, ISO_WORLD_HEIGHT);
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
    const debug = this.add.graphics();
    debug.fillStyle(0xff2020, 0.28);
    debug.fillRect(x, y, width, height);
    debug.lineStyle(2, 0xff3030, 1);
    debug.strokeRect(x, y, width, height);
    debug.setDepth(10000);
    this.collisionDebugObjects.push(debug);
    return debug;
  }

  addStaticCollision(x, y, width, height) {
    const body = this.add.zone(x, y, width, height);
    this.physics.add.existing(body, true);
    this.staticCollisionBodies.push(body);
    this.staticColliders.push(this.physics.add.collider(this.knight, body));

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

    for (let tileY = 0; tileY < ISO_MAP_ROWS; tileY++) {
      for (let tileX = 0; tileX < ISO_MAP_COLUMNS; tileX++) {
        const center = isoTileToWorld(tileX, tileY);
        const isPath = isIsoPavedTile(tileX, tileY);
        const color = isPath ? pathColor : grassColor;
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
          .setScale(0.78);
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
          this.addLayerObject('ground', paving, -900);
        }
      }
    }

    this.addLayerObject('ground', ground, -1100);
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
      this.addLayerObject(
        'structures',
        sprite,
        sprite.y + (asset.depthOffset ?? 0)
      );
    }
  }

  drawStairwayDebug() {
    const lower = getStairwayPoint(0, this.castleDoorAnchor);
    const upper = getStairwayPoint(1, this.castleDoorAnchor);
    const pathX = upper.x - lower.x;
    const pathY = upper.y - lower.y;
    const length = Math.hypot(pathX, pathY);
    const normalX = -pathY / length;
    const normalY = pathX / length;
    const graphics = this.add.graphics();

    graphics.fillStyle(0x50ffbd, 0.16);
    graphics.fillPoints([
      { x: lower.x + normalX * ISO_STAIRWAY_HALF_WIDTH, y: lower.y + normalY * ISO_STAIRWAY_HALF_WIDTH },
      { x: upper.x + normalX * ISO_STAIRWAY_HALF_WIDTH, y: upper.y + normalY * ISO_STAIRWAY_HALF_WIDTH },
      { x: upper.x - normalX * ISO_STAIRWAY_HALF_WIDTH, y: upper.y - normalY * ISO_STAIRWAY_HALF_WIDTH },
      { x: lower.x - normalX * ISO_STAIRWAY_HALF_WIDTH, y: lower.y - normalY * ISO_STAIRWAY_HALF_WIDTH }
    ], true);
    graphics.lineStyle(2, 0x50ffbd, 0.9);
    graphics.lineBetween(
      lower.x + normalX * ISO_STAIRWAY_HALF_WIDTH,
      lower.y + normalY * ISO_STAIRWAY_HALF_WIDTH,
      upper.x + normalX * ISO_STAIRWAY_HALF_WIDTH,
      upper.y + normalY * ISO_STAIRWAY_HALF_WIDTH
    );
    graphics.lineBetween(
      lower.x - normalX * ISO_STAIRWAY_HALF_WIDTH,
      lower.y - normalY * ISO_STAIRWAY_HALF_WIDTH,
      upper.x - normalX * ISO_STAIRWAY_HALF_WIDTH,
      upper.y - normalY * ISO_STAIRWAY_HALF_WIDTH
    );
    graphics.lineStyle(1, 0xffda74, 0.95);
    graphics.strokeCircle(this.castleEntrance.x, this.castleEntrance.y, this.castleEntrance.radius);
    graphics.setDepth(10001);
    this.collisionDebugObjects.push(graphics);
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
        this.addStaticCollision(x, y, width, height);
      }
    }

    const { x: doorX, y: doorY } = this.castleDoorAnchor;
    for (const side of [-1, 1]) {
      this.addStaticCollision(
        doorX + side * 350,
        doorY + 1,
        510,
        20
      );
      this.addStaticCollision(
        doorX + side * 84,
        doorY + 38,
        12,
        52
      );
      this.addStaticCollision(
        doorX + side * 410,
        doorY - 10,
        74,
        28
      );
      this.addStaticCollision(
        doorX + side * 610,
        doorY + 3,
        110,
        40
      );
    }

    const lower = getStairwayPoint(0, this.castleDoorAnchor);
    const upper = getStairwayPoint(1, this.castleDoorAnchor);
    const pathX = upper.x - lower.x;
    const pathY = upper.y - lower.y;
    const length = Math.hypot(pathX, pathY);
    const normalX = -pathY / length;
    const normalY = pathX / length;

    for (let step = -1; step <= 13; step++) {
      const progress = step / 12;
      const point = getStairwayPoint(progress, this.castleDoorAnchor);
      for (const side of [-1, 1]) {
        this.addStaticCollision(
          point.x + side * normalX * (ISO_STAIRWAY_HALF_WIDTH + 7),
          point.y + side * normalY * (ISO_STAIRWAY_HALF_WIDTH + 7),
          8,
          10
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
    this.physics.add.existing(this.fountainBody, true);
    this.fountainCollisionDebug = this.addCollisionDebug(this.fountainBody);
  }

  drawForegroundLayer() {
    this.addManifestSprites('foreground', ISO_ASSET_MANIFEST.foreground);
  }

  update() {
    if (this.transitioning || this.dialogueActive) return;

    const entranceDistance = Phaser.Math.Distance.Between(
      this.knight.x,
      this.knight.y,
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
          y: this.castleEntrance.y + 10
        }
      });
      return;
    }

    updateKnightMovement(this);
    const stairwayPosition = getStairwayProgress(
      this.knight.x,
      this.knight.y,
      this.castleDoorAnchor
    );
    const onStairway =
      stairwayPosition.distance <= ISO_STAIRWAY_HALF_WIDTH + 12;
    const depth = onStairway && this.staircaseSprite
      ? Math.max(this.knight.body.bottom, this.staircaseSprite.depth + 1)
      : this.knight.body.bottom;
    this.knight.setDepth(depth);
  }
}
