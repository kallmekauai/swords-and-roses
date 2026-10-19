const ISO_TILE_WIDTH = 64;
const ISO_TILE_HEIGHT = 32;

const ISO_MAP_COLUMNS = 28;
const ISO_MAP_ROWS = 22;
const ISO_ORIGIN_X = ISO_MAP_ROWS * ISO_TILE_WIDTH / 2 + 32;
const ISO_ORIGIN_Y = 40;
const ISO_WORLD_WIDTH = ISO_ORIGIN_X + ISO_MAP_COLUMNS * ISO_TILE_WIDTH / 2 + 32;
const ISO_WORLD_HEIGHT =
  ISO_ORIGIN_Y + (ISO_MAP_COLUMNS + ISO_MAP_ROWS) * ISO_TILE_HEIGHT / 2 + 32;

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
    this.load.image('royal-academy-concept', 'assets/art/royal-academy-concept.jpg');
  }

  create() {
    const previewConcept =
      new URLSearchParams(window.location.search).get('preview') === 'concept';

    if (previewConcept) {
      this.showConceptPreview();
      return;
    }

    createOmarAnimations(this);
    this.cameras.main.setBackgroundColor('#23313b');
    this.physics.world.setBounds(0, 0, ISO_WORLD_WIDTH, ISO_WORLD_HEIGHT);

    this.renderLayers = {
      ground: [],
      structures: [],
      characters: [],
      foreground: []
    };
    this.collisionData = [
      { tileX: 7.75, tileY: 10.5, width: 128, height: 52 },
      { tileX: 10.5, tileY: 7.75, width: 128, height: 52 }
    ];

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
    this.cameras.main.startFollow(this.knight, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);
  }

  showConceptPreview() {
    this.cameras.main.setBackgroundColor('#202536');

    const concept = this.add.image(0, 0, 'royal-academy-concept')
      .setOrigin(0.5)
      .setScrollFactor(0);
    const scale = Math.min(WIDTH / concept.width, HEIGHT / concept.height);
    concept.setScale(scale);
    concept.setPosition(WIDTH / 2, HEIGHT / 2);

    this.add.text(WIDTH / 2, 12, 'STATIC CONCEPT PREVIEW — NOT A PLAYABLE MAP', {
      fontFamily: 'Georgia',
      fontSize: '13px',
      color: '#fff0d7',
      backgroundColor: '#202536',
      padding: { x: 8, y: 5 }
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10000);
  }

  addLayerObject(layer, gameObject, depth) {
    gameObject.setDepth(depth);
    this.renderLayers[layer].push(gameObject);
    return gameObject;
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

        if (isPath && (tileX + tileY) % 3 === 0) {
          ground.fillStyle(0xd2c6b0, 0.5);
          ground.fillRect(center.x - 11, center.y - 2, 8, 2);
          ground.fillRect(center.x + 5, center.y + 3, 6, 2);
        } else if (!isPath && (tileX * 7 + tileY) % 13 === 0) {
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
  }

  drawStructureLayer() {
    const castleCenter = isoTileToWorld(7, 7);
    const palace = this.add.graphics();

    // Deliberately simple placeholder silhouette; replace with authored tiles.
    palace.fillStyle(0x252b40, 0.45);
    palace.fillEllipse(castleCenter.x + 8, castleCenter.y + 112, 390, 78);
    palace.fillStyle(0xaaaeb8, 1);
    palace.fillRect(castleCenter.x - 154, castleCenter.y + 4, 308, 100);
    palace.fillStyle(0xf1ead9, 1);
    palace.fillRect(castleCenter.x - 148, castleCenter.y, 296, 96);
    palace.fillStyle(0xc4c0b9, 1);
    palace.fillRect(castleCenter.x - 148, castleCenter.y + 84, 296, 12);
    palace.fillStyle(0xeee2c7, 1);
    palace.fillRect(castleCenter.x - 158, castleCenter.y - 8, 316, 12);
    palace.fillStyle(0x315b9a, 1);
    palace.fillTriangle(
      castleCenter.x - 168, castleCenter.y,
      castleCenter.x, castleCenter.y - 110,
      castleCenter.x + 168, castleCenter.y
    );
    palace.fillStyle(0x729bd0, 1);
    palace.fillTriangle(
      castleCenter.x - 100, castleCenter.y - 4,
      castleCenter.x - 2, castleCenter.y - 100,
      castleCenter.x - 2, castleCenter.y - 4
    );
    palace.fillStyle(0xd8b866, 1);
    palace.fillRect(castleCenter.x - 170, castleCenter.y - 1, 340, 5);

    palace.fillStyle(0x203d70, 1);
    palace.fillTriangle(castleCenter.x - 112, castleCenter.y + 4, castleCenter.x - 78, castleCenter.y - 94, castleCenter.x - 44, castleCenter.y + 4);
    palace.fillTriangle(castleCenter.x + 44, castleCenter.y + 4, castleCenter.x + 78, castleCenter.y - 94, castleCenter.x + 112, castleCenter.y + 4);
    palace.fillStyle(0xf1ead9, 1);
    palace.fillRect(castleCenter.x - 108, castleCenter.y + 1, 60, 82);
    palace.fillRect(castleCenter.x + 48, castleCenter.y + 1, 60, 82);

    for (const x of [castleCenter.x - 78, castleCenter.x - 26, castleCenter.x + 26, castleCenter.x + 78]) {
      palace.fillStyle(0x315b9a, 1);
      palace.fillRoundedRect(x - 10, castleCenter.y + 22, 20, 48, 9);
      palace.fillStyle(0x729bd0, 0.9);
      palace.fillRect(x - 5, castleCenter.y + 31, 3, 29);
      palace.fillStyle(0xd8b866, 1);
      palace.fillRect(x - 1, castleCenter.y + 22, 2, 48);
    }

    // Central doorway is a visible gap and remains clear in collision data.
    palace.fillStyle(0x29283c, 1);
    palace.fillRoundedRect(castleCenter.x - 23, castleCenter.y + 44, 46, 53, 22);
    palace.fillStyle(0x815d53, 1);
    palace.fillRect(castleCenter.x - 17, castleCenter.y + 61, 34, 36);
    palace.fillStyle(0xd8b866, 1);
    palace.fillRect(castleCenter.x - 1, castleCenter.y + 62, 2, 35);
    palace.fillCircle(castleCenter.x - 5, castleCenter.y + 79, 2);
    palace.fillCircle(castleCenter.x + 5, castleCenter.y + 79, 2);

    this.addLayerObject('structures', palace, castleCenter.y + 100);

    for (const [tileX, tileY] of [[3, 12], [21, 12], [5, 17], [20, 17]]) {
      const tree = isoTileToWorld(tileX, tileY);
      const foliage = this.add.graphics();
      foliage.fillStyle(0x294c3c, 0.35);
      foliage.fillEllipse(tree.x + 4, tree.y + 15, 64, 22);
      foliage.fillStyle(0x624c45, 1);
      foliage.fillRect(tree.x - 5, tree.y - 9, 10, 34);
      foliage.fillStyle(0x386447, 1);
      foliage.fillCircle(tree.x, tree.y - 26, 26);
      foliage.fillStyle(0x628b59, 1);
      foliage.fillCircle(tree.x - 10, tree.y - 31, 14);
      foliage.fillStyle(0x86a666, 1);
      foliage.fillCircle(tree.x - 9, tree.y - 37, 5);
      this.addLayerObject('structures', foliage, tree.y + 28);
    }

    this.drawPlaceholderFountain(isoTileToWorld(14, 14));
  }

  drawPlaceholderFountain(center) {
    const fountain = this.add.graphics();
    fountain.fillStyle(0x303849, 0.4);
    fountain.fillEllipse(center.x + 4, center.y + 18, 88, 38);
    fountain.fillStyle(0x777f8e, 1);
    fountain.fillEllipse(center.x, center.y + 4, 82, 36);
    fountain.fillStyle(0xe4dfd2, 1);
    fountain.fillEllipse(center.x, center.y, 76, 32);
    fountain.fillStyle(0x315b9a, 1);
    fountain.fillEllipse(center.x, center.y - 1, 56, 22);
    fountain.fillStyle(0x729bd0, 1);
    fountain.fillEllipse(center.x - 10, center.y - 5, 14, 6);
    fountain.fillStyle(0xe4dfd2, 1);
    fountain.fillRect(center.x - 7, center.y - 24, 14, 24);
    fountain.fillStyle(0xd8b866, 1);
    fountain.fillRect(center.x - 13, center.y - 26, 26, 4);
    fountain.fillStyle(0xa9dcec, 1);
    fountain.fillCircle(center.x, center.y - 30, 5);
    this.addLayerObject('structures', fountain, center.y + 22);
  }

  createCollisionLayer() {
    this.solidObstacles = this.physics.add.staticGroup();

    for (const collision of this.collisionData) {
      const center = isoTileToWorld(collision.tileX, collision.tileY);
      const body = this.add.rectangle(
        center.x,
        center.y,
        collision.width,
        collision.height
      );
      this.physics.add.existing(body, true);
      body.setVisible(false);
      this.solidObstacles.add(body);
    }
  }

  drawForegroundLayer() {
    for (const [tileX, tileY] of [[2, 15], [24, 14], [4, 19], [22, 19]]) {
      const bushPosition = isoTileToWorld(tileX, tileY);
      const bush = this.add.graphics();
      bush.fillStyle(0x315b43, 1);
      bush.fillEllipse(bushPosition.x, bushPosition.y, 66, 28);
      bush.fillStyle(0x6c9560, 1);
      bush.fillCircle(bushPosition.x - 18, bushPosition.y - 4, 14);
      bush.fillCircle(bushPosition.x, bushPosition.y - 9, 16);
      bush.fillCircle(bushPosition.x + 18, bushPosition.y - 3, 14);
      bush.fillStyle(0xf1a8c0, 1);
      bush.fillCircle(bushPosition.x - 13, bushPosition.y - 12, 4);
      bush.fillStyle(0xf7d98d, 1);
      bush.fillCircle(bushPosition.x + 3, bushPosition.y - 17, 4);
      bush.fillStyle(0xe27eaa, 1);
      bush.fillCircle(bushPosition.x + 17, bushPosition.y - 10, 4);
      this.addLayerObject('foreground', bush, bushPosition.y + 15);
    }
  }

  update() {
    updateKnightMovement(this);
    this.knight.setDepth(this.knight.y + 24);
  }
}
