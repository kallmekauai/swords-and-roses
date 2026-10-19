const ISO_TILE_WIDTH = 64;
const ISO_TILE_HEIGHT = 32;

const ISO_MAP_COLUMNS = 28;
const ISO_MAP_ROWS = 22;
const ISO_ORIGIN_X = ISO_MAP_ROWS * ISO_TILE_WIDTH / 2 + 32;
const ISO_ORIGIN_Y = 40;
const ISO_WORLD_WIDTH = ISO_ORIGIN_X + ISO_MAP_COLUMNS * ISO_TILE_WIDTH / 2 + 32;
const ISO_WORLD_HEIGHT =
  ISO_ORIGIN_Y + (ISO_MAP_COLUMNS + ISO_MAP_ROWS) * ISO_TILE_HEIGHT / 2 + 32;

const ISO_ASSET_MANIFEST = {
  ground: [],
  buildings: [],
  decorations: [],
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
  }

  create() {
    createOmarAnimations(this);
    this.cameras.main.setBackgroundColor('#557653');
    this.physics.world.setBounds(0, 0, ISO_WORLD_WIDTH, ISO_WORLD_HEIGHT);

    this.renderLayers = {
      ground: [],
      structures: [],
      decorations: [],
      characters: [],
      foreground: []
    };

    this.collisionData = [];

    this.drawGroundLayer();
    this.drawStructureLayer();
    this.createCollisionLayer();

    const spawn = isoTileToWorld(16, 16);
    this.knight = createKnight(this, spawn.x, spawn.y);
    this.knight.setCollideWorldBounds(true);
    this.physics.add.collider(this.knight, this.solidObstacles);
    this.renderLayers.characters.push(this.knight);

    this.drawForegroundLayer();
    this.add.text(16, 14, 'EXPERIMENTAL ISOMETRIC COURTYARD  |  WASD / ARROWS', {
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
  }

  addLayerObject(layer, gameObject, depth) {
    gameObject.setDepth(depth);
    this.renderLayers[layer].push(gameObject);
    return gameObject;
  }

  addIsometricSprite(layer, textureKey, tileX, tileY, options = {}) {
    const position = isoTileToWorld(tileX, tileY);
    const sprite = this.add.image(position.x, position.y, textureKey)
      .setOrigin(options.originX ?? 0.5, options.originY ?? 1);
    return this.addLayerObject(layer, sprite, position.y);
  }

  drawGroundLayer() {
    const ground = this.add.graphics();
    const pathColor = 0xb8ad9a;
    const grassColors = [0x557653, 0x5d8059, 0x63855d, 0x6a895f];

    for (let tileY = 0; tileY < ISO_MAP_ROWS; tileY++) {
      for (let tileX = 0; tileX < ISO_MAP_COLUMNS; tileX++) {
        const center = isoTileToWorld(tileX, tileY);
        const isPath =
          (Math.abs(tileX - tileY) <= 1 && tileY >= 5 && tileY <= 20) ||
          (tileX >= 6 && tileX <= 19 && tileY >= 10 && tileY <= 13);
        const isGarden =
          (tileX < 5 || tileX > 21) && tileY > 4 && tileY < 18;
        const color = isPath
          ? pathColor
          : isGarden
            ? 0x456e4c
            : grassColors[(tileX * 3 + tileY * 5) % grassColors.length];
        const points = [
          { x: center.x, y: center.y - ISO_TILE_HEIGHT / 2 },
          { x: center.x + ISO_TILE_WIDTH / 2, y: center.y },
          { x: center.x, y: center.y + ISO_TILE_HEIGHT / 2 },
          { x: center.x - ISO_TILE_WIDTH / 2, y: center.y }
        ];

        ground.fillStyle(color, 1);
        ground.fillPoints(points, true);
        ground.lineStyle(1, isPath ? 0x8c8278 : 0x45644b, 0.52);
        ground.strokePoints(points, true);
      }
    }

    this.addLayerObject('ground', ground, -1000);
    this.addManifestSprites('ground', ISO_ASSET_MANIFEST.ground, -999);
  }

  drawStructureLayer() {
    this.addManifestSprites('structures', ISO_ASSET_MANIFEST.buildings);
    this.addManifestSprites('decorations', ISO_ASSET_MANIFEST.decorations);
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
      if (fixedDepth !== undefined) sprite.setDepth(fixedDepth);
      else sprite.setDepth(position.y + (asset.depthOffset ?? 0));
    }
  }

  createCollisionLayer() {
    this.solidObstacles = this.physics.add.staticGroup();

    for (const collision of this.collisionData) {
      const center = isoTileToWorld(collision.tileX, collision.tileY);
      const body = this.add.rectangle(
        center.x + (collision.offsetX ?? 0),
        center.y + (collision.offsetY ?? 0),
        collision.width,
        collision.height
      );
      this.physics.add.existing(body, true);
      body.setVisible(false);
      this.solidObstacles.add(body);
    }
  }

  drawForegroundLayer() {
    this.addManifestSprites('foreground', ISO_ASSET_MANIFEST.foreground);
  }

  update() {
    updateKnightMovement(this);
    this.knight.setDepth(this.knight.y + 24);
  }
}
