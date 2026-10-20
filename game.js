const WIDTH = 1280;
const HEIGHT = 720;
const ACADEMY_ROOM_SCALE = 1.5;
const ACADEMY_ROOM_OFFSET_X = 40;

function courtyardPoint(x, y) {
  return {
    x: COURTYARD_ORIGIN_X + x,
    y: COURTYARD_ORIGIN_Y + y
  };
}

function academyRoomPoint(x, y) {
  return {
    x: ACADEMY_ROOM_OFFSET_X + x * ACADEMY_ROOM_SCALE,
    y: y * ACADEMY_ROOM_SCALE
  };
}

const kauaiDialogue = [
  {
    speaker: "Princess Kauai",
    text: "You're the knight who speaks of the stars, aren't you?"
  },
  {
    speaker: "Knight Omar",
    text: "I suppose I am. The universe is full of mysteries."
  },
  {
    speaker: "Princess Kauai",
    text: "And do you believe everything happens for a reason?"
  },
  {
    speaker: "Knight Omar",
    text: "Perhaps some things are written in the stars."
  },
  {
    speaker: "Princess Kauai",
    text: "Then perhaps our meeting was one of them."
  }
];

const rolandoDialogue = [
  { speaker: 'Rolando', text: 'Welcome to the Royal Academy, Sir Omar!' },
  { speaker: 'Omar', text: "Thank you. I'm still finding my way around." },
  { speaker: 'Rolando', text: 'Every great knight begins somewhere.' }
];

function createRolandoTexture(scene) {
  const textureKey = 'rolando-pixel';
  if (scene.textures.exists(textureKey)) return textureKey;

  const texture = scene.textures.createCanvas(textureKey, 32, 48);
  const context = texture.getContext();
  const pixel = (x, y, width, height, color) => {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  };

  pixel(5, 19, 22, 24, '#6f3548');
  pixel(8, 32, 7, 9, '#555b70');
  pixel(18, 32, 7, 9, '#555b70');
  pixel(7, 39, 8, 7, '#302638');
  pixel(18, 39, 8, 7, '#302638');
  pixel(3, 20, 6, 15, '#8d776e');
  pixel(24, 20, 6, 15, '#8d776e');
  pixel(8, 19, 17, 16, '#c7ad83');
  pixel(14, 20, 5, 12, '#e2c875');
  pixel(8, 33, 17, 4, '#77644f');
  pixel(10, 7, 13, 13, '#b47a57');
  pixel(11, 13, 3, 2, '#211c25');
  pixel(19, 13, 3, 2, '#211c25');
  pixel(8, 4, 17, 6, '#4a3028');
  pixel(8, 9, 3, 6, '#4a3028');
  pixel(23, 9, 3, 6, '#4a3028');
  pixel(3, 19, 7, 5, '#d9c69b');
  pixel(23, 19, 7, 5, '#d9c69b');

  texture.refresh();
  return textureKey;
}

function createNpc(
  scene,
  { name, x, y, spriteKey, dialogue, interactionDistance = 72 }
) {
  const displayScale = scene.actorDisplayScale || 1;
  const sprite = scene.add.image(x, y, spriteKey)
    .setDisplaySize(32 * displayScale, 48 * displayScale)
    .setOrigin(0.5, scene.depthSortActors ? 1 : 0.5)
    .setDepth(scene.depthSortActors ? y : 3);
  const npc = {
    name,
    x,
    y,
    sprite,
    dialogue,
    interactionDistance: interactionDistance * displayScale
  };
  scene.npcs.push(npc);
  return npc;
}

function findNearbyNpc(scene) {
  return scene.npcs.find(npc =>
    Phaser.Math.Distance.Between(scene.knight.x, scene.knight.y, npc.x, npc.y) <
      npc.interactionDistance
  );
}

function beginDialogue(scene, lines) {
  scene.dialogueActive = true;
  scene.dialogueIndex = 0;
  scene.dialogueLines = lines;
  showDialogueLine(scene);
}

function advanceDialogue(scene) {
  scene.dialogueIndex++;
  if (scene.dialogueIndex >= scene.dialogueLines.length) {
    scene.dialogueActive = false;
    document.getElementById('dialogue-box').classList.add('hidden');
    return;
  }

  showDialogueLine(scene);
}

function showDialogueLine(scene) {
  const line = scene.dialogueLines[scene.dialogueIndex];
  document.getElementById('speaker-name').textContent = line.speaker;
  document.getElementById('dialogue-text').textContent = line.text;
  document.getElementById('dialogue-box').classList.remove('hidden');
}

function createKnight(scene, x, y, displayScale = 1) {
  const knight = scene.physics.add.sprite(x, y, 'omar-down-0');
  knight.setDisplaySize(32 * displayScale, 48 * displayScale);
  knight.setDepth(2);
  knight.body.setSize(20, 12);
  knight.body.setOffset(6, 34);
  knight.setCollideWorldBounds(true);

  scene.cursors = scene.input.keyboard.createCursorKeys();
  scene.keys = scene.input.keyboard.addKeys('W,A,S,D,E');
  scene.interactKey = scene.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.E
  );

  return knight;
}

function updateKnightMovement(scene) {
  const speed = 190 * (scene.movementScale || 1);
  const body = scene.knight.body;
  body.setVelocity(0);
  if (scene.cursors.left.isDown || scene.keys.A.isDown) body.setVelocityX(-speed);
  else if (scene.cursors.right.isDown || scene.keys.D.isDown) body.setVelocityX(speed);
  if (scene.cursors.up.isDown || scene.keys.W.isDown) body.setVelocityY(-speed);
  else if (scene.cursors.down.isDown || scene.keys.S.isDown) body.setVelocityY(speed);
  body.velocity.normalize().scale(speed);

  let direction = null;
  if (body.velocity.x < 0) direction = 'left';
  else if (body.velocity.x > 0) direction = 'right';
  else if (body.velocity.y < 0) direction = 'up';
  else if (body.velocity.y > 0) direction = 'down';

  if (direction) scene.knight.anims.play(`walk-${direction}`, true);
  else scene.knight.anims.stop();
}

function createInteractionPrompt(scene) {
  return scene.add.text(WIDTH / 2, HEIGHT - 20, '', {
    fontFamily: 'Georgia',
    fontSize: '14px',
    color: '#fff0d7',
    backgroundColor: '#282039',
    padding: { x: 10, y: 6 }
  }).setOrigin(0.5).setDepth(20).setScrollFactor(0).setVisible(false);
}

function transitionTo(scene, target, data) {
  if (scene.transitioning) return;

  scene.transitioning = true;
  scene.knight.setVelocity(0, 0);
  scene.interactionPrompt.setVisible(false);
  scene.cameras.main.once('camerafadeoutcomplete', () => {
    scene.scene.start(target, data);
  });
  scene.cameras.main.fadeOut(250, 0, 0, 0);
}


class AcademyScene extends Phaser.Scene {
  constructor() { super('Academy'); }

  preload() {
    this.load.svg('omar', 'assets/omar.svg', {
      width: 64,
      height: 96
    });
    this.load.svg('kauai', 'assets/kauai.svg', {
  width: 48,
  height: 64
});
  }

  create(data = {}) {
    createOmarAnimations(this);
    this.cameras.main.setBackgroundColor('#769b67');
    createAcademyMap(this);
    const princessPosition = courtyardPoint(550, 385);
    this.princess = this.add.sprite(princessPosition.x, princessPosition.y, 'kauai');

    this.princess.setDisplaySize(48, 64);
    this.princess.setDepth(2);
    this.dialogueActive = false;
    this.dialogueIndex = 0;
    this.transitioning = false;

    this.add.text(WIDTH / 2, 18, 'CHAPTER I — WRITTEN IN THE STARS', {
      fontFamily: 'Georgia', fontSize: '22px', color: '#fff0d7'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

    const spawn = data.spawn || courtyardPoint(400, 385);
    this.knight = createKnight(this, spawn.x, spawn.y);
    this.physics.add.collider(this.knight, this.solidObstacles);
    this.interactionPrompt = createInteractionPrompt(this);
    this.cameras.main.fadeIn(250, 0, 0, 0);

    const starPosition = courtyardPoint(650, 385);
    this.star = this.add.star(starPosition.x, starPosition.y, 5, 9, 18, 0xffd86d);
    this.tweens.add({
      targets: this.star,
      y: starPosition.y - 11,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    this.completed = false;

    this.cameras.main.setBounds(0, 0, COURTYARD_WORLD_WIDTH, COURTYARD_WORLD_HEIGHT);
    this.cameras.main.centerOn(this.knight.x, this.knight.y);
    this.cameras.main.startFollow(this.knight, true, 0.08, 0.08);
    this.cameras.main.setRoundPixels(true);
  }

  update() {
    if (this.transitioning) return;

    if (this.dialogueActive) {
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        advanceDialogue(this);
      }
      this.knight.setVelocity(0, 0);
      this.knight.anims.stop();
      return;
    }

    const entranceDistance = Phaser.Math.Distance.Between(
      this.knight.x,
      this.knight.y,
      this.castleEntrance.x,
      this.castleEntrance.y
    );
    this.interactionPrompt
      .setText('Press E to enter the Royal Academy.')
      .setVisible(entranceDistance < this.castleEntrance.radius);

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      const princessDistance = Phaser.Math.Distance.Between(
        this.knight.x,
        this.knight.y,
        this.princess.x,
        this.princess.y
      );
      if (princessDistance < 75) {
        this.startKauaiDialogue();
        return;
      }

      if (entranceDistance < this.castleEntrance.radius) {
        transitionTo(this, 'AcademyInterior', { spawn: { x: 400, y: 375 } });
        return;
      }
    }

    if (this.dialogueActive) {
      this.knight.setVelocity(0, 0);
      this.knight.anims.stop();
      return;
    }

    updateKnightMovement(this);

    if (!this.completed && Phaser.Input.Keyboard.JustDown(this.keys.E) &&
        Phaser.Math.Distance.Between(this.knight.x, this.knight.y, this.star.x, this.star.y) < 65) {
      this.completed = true;
      this.star.destroy();
      document.getElementById('message').textContent =
        'Memory Fragment collected! Every great story begins beneath the same sky.';
    }
  }
  
  startKauaiDialogue() {
    beginDialogue(this, kauaiDialogue);
  }

} // End of AcademyScene class

class AcademyInteriorScene extends Phaser.Scene {
  constructor() { super('AcademyInterior'); }

  preload() {
    this.load.image('interior-floor', 'assets/art/academy-cobblestone-tile.png');
    this.load.image('interior-floor-inlay', 'assets/art/academy-cobblestone-inlay.png');
    this.load.image('interior-window', 'assets/art/castle-modules/wall-window.png');
    this.load.image('interior-stained-glass', 'assets/art/academy-stained-glass-wall.png');
    this.load.image('interior-banner', 'assets/art/castle-modules/wall-banner.png');
    this.load.image('interior-column', 'assets/art/castle-modules/wall-column.png');
    this.load.image('interior-staircase', 'assets/art/castle-modules/grand-staircase.png');
    this.load.image('interior-door', 'assets/art/castle-modules/entrance-double-doors.png');
    this.load.image('interior-rose-urn', 'assets/art/rose-urn.png');
  }

  create(data = {}) {
    createOmarAnimations(this);
    this.physics.world.setBounds(240, 20, 1280, 850);
    this.cameras.main.setBackgroundColor('#20243a');
    this.returnScene = data.returnScene || 'Academy';
    this.returnSpawn = data.returnSpawn || courtyardPoint(400, 230);
    this.drawInteriorFloor();
    this.drawInteriorArchitecture();

    this.solidObstacles = this.physics.add.staticGroup();
    this.createInteriorCollisions();

    const isometricEntrance = data.returnScene === 'IsometricCourtyard';
    const spawn = data.spawn || { x: 400, y: 375 };
    const roomSpawn = isometricEntrance
      ? { x: 736, y: 474 }
      : academyRoomPoint(spawn.x, spawn.y);
    this.interiorExit = { x: 736, y: 562, radius: 62 };
    this.knight = createKnight(this, roomSpawn.x, roomSpawn.y);
    this.physics.add.collider(this.knight, this.solidObstacles);
    this.knight.setDepth(this.knight.y);
    this.actorDisplayScale = 1;
    this.movementScale = 1;
    this.interactionPrompt = createInteractionPrompt(this);
    this.transitioning = false;
    this.dialogueActive = false;
    this.npcs = [];
    createNpc(this, {
      name: 'Rolando',
      x: 1024,
      y: 492,
      spriteKey: createRolandoTexture(this),
      dialogue: rolandoDialogue
    });
    this.add.text(WIDTH / 2, 24, 'THE GRAND ENTRANCE HALL', {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color: '#fff0d7',
      backgroundColor: '#20243a',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.cameras.main.setBounds(240, 20, 1280, 850);
    this.cameras.main.startFollow(this.knight, true, 0.08, 0.08);
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  interiorTilePoint(tileX, tileY) {
    return {
      x: 800 + (tileX - tileY) * 32,
      y: 150 + (tileX + tileY) * 16
    };
  }

  drawInteriorFloor() {
    const columns = 22;
    const rows = 14;

    for (let tileY = 0; tileY < rows; tileY++) {
      for (let tileX = 0; tileX < columns; tileX++) {
        const point = this.interiorTilePoint(tileX, tileY);
        const tile = this.add.image(point.x, point.y, 'interior-floor')
          .setOrigin(0.5, 0.5);
        tile.setDepth(-1000 + (tileX + tileY) * 0.01);
      }
    }

    const medallion = this.interiorTilePoint(11, 7);
    this.add.image(medallion.x, medallion.y, 'interior-floor-inlay')
      .setOrigin(0.5, 0.5)
      .setDepth(-900);
  }

  drawInteriorArchitecture() {
    const placeWall = (tileX, tileY, key, flipX = false, scale = 0.82) => {
      const point = this.interiorTilePoint(tileX, tileY);
      const wall = this.add.image(point.x, point.y + 8, key)
        .setOrigin(0.5, 1)
        .setScale(scale);
      if (flipX) wall.setFlipX(true);
      wall.setDepth(point.y);
    };

    for (let tileX = 1; tileX < 21; tileX += 4) {
      placeWall(tileX, 0, 'interior-window', false, 0.8);
    }
    for (let tileY = 2; tileY < 13; tileY += 4) {
      placeWall(0, tileY, 'interior-stained-glass', true, 0.92);
      placeWall(21, tileY, 'interior-window', false, 0.8);
    }
    for (let tileX = 1; tileX < 10; tileX += 4) {
      placeWall(tileX, 13, 'interior-banner', true, 0.78);
    }
    for (let tileX = 13; tileX < 21; tileX += 4) {
      placeWall(tileX, 13, 'interior-banner', false, 0.78);
    }

    for (const [tileX, tileY, flipX] of [
      [4, 1, false],
      [17, 1, true],
      [2, 7, true],
      [19, 7, false]
    ]) {
      const point = this.interiorTilePoint(tileX, tileY);
      const column = this.add.image(point.x, point.y + 6, 'interior-column')
        .setOrigin(0.5, 1)
        .setScale(0.72)
        .setFlipX(flipX);
      column.setDepth(point.y + 1);
    }

    const stairPoint = this.interiorTilePoint(11, 4);
    const staircase = this.add.image(
      stairPoint.x,
      stairPoint.y + 54,
      'interior-staircase'
    )
      .setOrigin(0.5, 1)
      .setScale(0.78);
    staircase.setDepth(staircase.y + 1);

    const doorPoint = this.interiorTilePoint(11, 13);
    const door = this.add.image(doorPoint.x, doorPoint.y + 20, 'interior-door')
      .setOrigin(0.5, 1)
      .setScale(0.72);
    door.setDepth(door.y + 1);

    for (const [tileX, tileY, flipX] of [
      [3, 8, false],
      [18, 8, true],
      [5, 11, false],
      [16, 11, true]
    ]) {
      const point = this.interiorTilePoint(tileX, tileY);
      const urn = this.add.image(point.x, point.y, 'interior-rose-urn')
        .setOrigin(0.5, 1)
        .setScale(0.48)
        .setFlipX(flipX);
      urn.setDepth(urn.y + 1);
    }
  }

  createInteriorCollisions() {
    const addObstacle = (x, y, width, height, reason) => {
      const obstacle = this.add.rectangle(x, y, width, height);
      this.physics.add.existing(obstacle, true);
      obstacle.setVisible(false);
      obstacle.setData('blockReason', reason);
      this.solidObstacles.add(obstacle);
    };

    for (let tile = 0; tile < 22; tile++) {
      const north = this.interiorTilePoint(tile, 0);
      const south = this.interiorTilePoint(tile, 13);
      addObstacle(north.x, north.y + 14, 46, 18, 'north hall wall');
      const doorway = tile >= 10 && tile <= 12;
      if (!doorway) {
        addObstacle(south.x, south.y + 14, 46, 18, 'south hall wall');
      }
    }
    for (let tile = 1; tile < 13; tile++) {
      const west = this.interiorTilePoint(0, tile);
      const east = this.interiorTilePoint(21, tile);
      addObstacle(west.x - 14, west.y, 18, 40, 'west hall wall');
      addObstacle(east.x + 14, east.y, 18, 40, 'east hall wall');
    }

    const stairPoint = this.interiorTilePoint(11, 4);
    addObstacle(
      stairPoint.x,
      stairPoint.y + 48,
      150,
      34,
      'upper staircase',
    );
    for (const [tileX, tileY] of [[4, 1], [17, 1], [2, 7], [19, 7]]) {
      const point = this.interiorTilePoint(tileX, tileY);
      addObstacle(point.x, point.y - 4, 30, 22, 'stone column');
    }
    for (const [tileX, tileY] of [[3, 8], [18, 8], [5, 11], [16, 11]]) {
      const point = this.interiorTilePoint(tileX, tileY);
      addObstacle(point.x, point.y - 8, 28, 20, 'rose urn');
    }
  }

  update() {
    if (this.transitioning) return;

    if (this.dialogueActive) {
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        advanceDialogue(this);
      }
      this.knight.setVelocity(0, 0);
      this.knight.anims.stop();
      this.interactionPrompt.setVisible(false);
      return;
    }

    const nearbyNpc = findNearbyNpc(this);
    const exitDistance = Phaser.Math.Distance.Between(
      this.knight.x,
      this.knight.y,
      this.interiorExit.x,
      this.interiorExit.y
    );
    const nearExit = exitDistance < this.interiorExit.radius;
    const prompt = nearbyNpc
      ? `Press E to talk to ${nearbyNpc.name}.`
      : nearExit
        ? 'Press E to return to the courtyard.'
        : '';
    this.interactionPrompt
      .setText(prompt)
      .setVisible(Boolean(prompt));

    if (nearbyNpc && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      beginDialogue(this, nearbyNpc.dialogue);
      this.knight.setVelocity(0, 0);
      this.knight.anims.stop();
      this.interactionPrompt.setVisible(false);
      return;
    }

    if (nearExit && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      transitionTo(this, this.returnScene, { spawn: this.returnSpawn });
      return;
    }

    updateKnightMovement(this);
    this.knight.setDepth(this.knight.y);
  }
}


const launchIsometric =
  new URLSearchParams(window.location.search).get('scene') === 'isometric';
const debugCollisions =
  new URLSearchParams(window.location.search).get('debugCollisions') === '1';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WIDTH,
    height: HEIGHT
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: debugCollisions,
      debugShowBody: debugCollisions,
      debugShowStaticBody: debugCollisions,
      debugShowVelocity: false
    }
  },
  scene: launchIsometric
    ? [IsometricCourtyardScene, AcademyInteriorScene]
    : [AcademyScene, AcademyInteriorScene]
});
