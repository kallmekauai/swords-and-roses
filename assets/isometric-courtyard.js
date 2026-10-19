const ISO_TILE_WIDTH = 64;
const ISO_TILE_HEIGHT = 32;

const ISO_MAP_COLUMNS = 24;
const ISO_MAP_ROWS = 18;
const ISO_ORIGIN_X = ISO_MAP_ROWS * ISO_TILE_WIDTH / 2 + 32;
const ISO_ORIGIN_Y = 40;
const ISO_WORLD_WIDTH = ISO_ORIGIN_X + ISO_MAP_COLUMNS * ISO_TILE_WIDTH / 2 + 32;
const ISO_WORLD_HEIGHT =
  ISO_ORIGIN_Y + (ISO_MAP_COLUMNS + ISO_MAP_ROWS) * ISO_TILE_HEIGHT / 2 + 32;
const ISO_FOUNTAIN_TILE = { x: 14, y: 12 };
const ISO_PLAYER_SPAWN_TILE = { x: 9, y: 15 };

const ISO_ASSET_MANIFEST = {
  ground: [],
  buildings: [],
  decorations: [],
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
  }

  create() {
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

    this.debugCollision =
      new URLSearchParams(window.location.search).get('debugCollision') === '1';
    this.fountainAsset = ISO_ASSET_MANIFEST.fountain[0];

    this.drawGroundLayer();
    this.drawStructureLayer();
    this.drawFountain(ISO_FOUNTAIN_TILE);

    const spawn = isoTileToWorld(
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
      .setOrigin(options.originX ?? 0.5, options.originY ?? 1)
      .setScale(options.scale ?? 1);
    return this.addLayerObject(
      layer,
      sprite,
      position.y + (options.depthOffset ?? 0)
    );
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
        const isGrass = !isPath;
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

        if (isPath && (tileX + tileY) % 3 === 0) {
          ground.fillStyle(0xd2c6b0, 0.65);
          ground.fillRect(center.x - 11, center.y - 2, 8, 2);
          ground.fillRect(center.x + 5, center.y + 3, 6, 2);
        } else if (isGrass && (tileX * 7 + tileY * 5) % 11 === 0) {
          ground.fillStyle(0xf2c1d2, 0.9);
          ground.fillCircle(center.x - 7, center.y, 2);
          ground.fillStyle(0xf2dd9b, 0.9);
          ground.fillCircle(center.x - 3, center.y - 3, 2);
          ground.fillStyle(0xd98fae, 0.9);
          ground.fillCircle(center.x + 1, center.y, 2);
        }
      }
    }

    this.addLayerObject('ground', ground, -1000);
    this.addManifestSprites('ground', ISO_ASSET_MANIFEST.ground, -999);
  }

  drawStructureLayer() {
    this.addManifestSprites('structures', ISO_ASSET_MANIFEST.buildings);
    this.addManifestSprites('decorations', ISO_ASSET_MANIFEST.decorations);
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
      if (fixedDepth !== undefined) sprite.setDepth(fixedDepth);
      else sprite.setDepth(position.y + (asset.depthOffset ?? 0));
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

    if (this.debugCollision) {
      const { x: bodyX, y: bodyY, width: bodyWidth, height: bodyHeight } =
        this.fountainBody.body;
      const debug = this.add.graphics();
      debug.fillStyle(0xff2020, 0.28);
      debug.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
      debug.lineStyle(2, 0xff3030, 1);
      debug.strokeRect(bodyX, bodyY, bodyWidth, bodyHeight);
      debug.setDepth(10000);
      this.fountainCollisionDebug = debug;
    }
  }

  drawForegroundLayer() {
    this.addManifestSprites('foreground', ISO_ASSET_MANIFEST.foreground);
  }

  update() {
    updateKnightMovement(this);
    this.knight.setDepth(this.knight.body.bottom);
  }
}
