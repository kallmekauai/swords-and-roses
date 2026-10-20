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

  create(data = {}) {
    createOmarAnimations(this);
    this.physics.world.setBounds(64, 0, 1152, 660);
    this.cameras.main.setBackgroundColor('#302a3b');

    const art = this.add.graphics();
    art.fillStyle(0x665f6d);
    art.fillRect(16, 16, 768, 448);
    art.fillStyle(0x9b8b7d);
    art.fillRect(40, 40, 720, 368);

    art.lineStyle(1, 0x857568, 0.65);
    for (let x = 40; x <= 760; x += 40) {
      art.lineBetween(x, 40, x, 408);
    }
    for (let y = 40; y <= 408; y += 32) {
      art.lineBetween(40, y, 760, y);
    }

    art.fillStyle(0x7b344b);
    art.fillRect(340, 180, 120, 228);
    art.fillStyle(0xc7a65f);
    art.fillRect(346, 186, 108, 216);
    art.fillStyle(0x7b344b);
    art.fillRect(352, 192, 96, 210);
    art.lineStyle(2, 0xe0c278, 0.9);
    art.lineBetween(352, 200, 448, 200);
    art.lineBetween(352, 394, 448, 394);

    for (const x of [120, 680]) {
      for (const y of [152, 304]) {
        art.fillStyle(0x6d5961);
        art.fillRect(x - 20, y - 22, 40, 44);
        art.fillStyle(0xd2b98b);
        art.fillRect(x - 15, y - 18, 30, 36);
        art.fillStyle(0x6e4d60);
        art.fillRect(x - 11, y - 13, 22, 26);
      }
    }

    art.fillStyle(0x75677b);
    art.fillRect(16, 16, 768, 24);
    art.fillRect(16, 16, 24, 448);
    art.fillRect(760, 16, 24, 448);
    art.fillRect(16, 408, 352, 32);
    art.fillRect(432, 408, 352, 32);

    art.fillStyle(0x362a38);
    art.fillRect(370, 390, 60, 42);
    art.fillStyle(0xc08b5c);
    art.fillRect(376, 394, 48, 34);
    art.fillStyle(0x352a39);
    art.fillRect(386, 400, 28, 28);
    art.fillStyle(0xe3c272);
    art.fillCircle(408, 414, 2);

    art.fillStyle(0x51465b);
    art.fillRect(292, 116, 216, 22);
    art.fillStyle(0x847283);
    art.fillRect(312, 96, 176, 20);
    art.fillRect(332, 76, 136, 20);
    art.fillRect(352, 56, 96, 20);
    art.fillStyle(0xd5bb8b);
    art.fillRect(292, 136, 216, 5);
    art.fillRect(312, 116, 176, 4);
    art.fillRect(332, 96, 136, 4);
    art.fillRect(352, 76, 96, 4);

    art.fillStyle(0x5b3f58);
    art.fillRect(90, 54, 84, 50);
    art.fillRect(626, 54, 84, 50);
    art.fillStyle(0xd5bb8b);
    art.fillRect(96, 60, 72, 38);
    art.fillRect(632, 60, 72, 38);
    art.fillStyle(0x8e5968);
    art.fillRect(102, 66, 60, 26);
    art.fillRect(638, 66, 60, 26);
    art.fillStyle(0xf0d391);
    art.fillCircle(132, 78, 6);
    art.fillCircle(668, 78, 6);
    art.setPosition(ACADEMY_ROOM_OFFSET_X, 0);
    art.setScale(ACADEMY_ROOM_SCALE);

    this.add.text(WIDTH / 2, 26, 'THE ROYAL ACADEMY', {
      fontFamily: 'Georgia', fontSize: '20px', color: '#fff0d7'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2);

    this.solidObstacles = this.physics.add.staticGroup();
    const addObstacle = (x, y, width, height) => {
      const position = academyRoomPoint(x, y);
      const obstacle = this.add.rectangle(
        position.x,
        position.y,
        width * ACADEMY_ROOM_SCALE,
        height * ACADEMY_ROOM_SCALE
      );
      this.physics.add.existing(obstacle, true);
      obstacle.setVisible(false);
      this.solidObstacles.add(obstacle);
    };

    addObstacle(400, 28, 768, 24);
    addObstacle(28, 240, 24, 400);
    addObstacle(772, 240, 24, 400);
    addObstacle(192, 424, 352, 32);
    addObstacle(608, 424, 352, 32);
    for (const [x, y, width, height] of [
      [400, 127, 216, 22],
      [400, 106, 176, 20],
      [400, 86, 136, 20],
      [400, 66, 96, 20]
    ]) {
      addObstacle(x, y, width, height);
    }
    for (const x of [120, 680]) {
      for (const y of [152, 304]) addObstacle(x, y, 30, 34);
    }

    const spawn = data.spawn || { x: 400, y: 375 };
    const roomSpawn = academyRoomPoint(spawn.x, spawn.y);
    this.knight = createKnight(this, roomSpawn.x, roomSpawn.y, ACADEMY_ROOM_SCALE);
    this.physics.add.collider(this.knight, this.solidObstacles);
    this.actorDisplayScale = ACADEMY_ROOM_SCALE;
    this.movementScale = ACADEMY_ROOM_SCALE;
    this.interactionPrompt = createInteractionPrompt(this);
    this.transitioning = false;
    this.dialogueActive = false;
    this.npcs = [];
    createNpc(this, {
      name: 'Rolando',
      ...academyRoomPoint(560, 232),
      spriteKey: createRolandoTexture(this),
      dialogue: rolandoDialogue
    });
    this.cameras.main.fadeIn(250, 0, 0, 0);
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
    this.interactionPrompt
      .setText(nearbyNpc ? `Press E to talk to ${nearbyNpc.name}.` : '')
      .setVisible(Boolean(nearbyNpc));

    if (nearbyNpc && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      beginDialogue(this, nearbyNpc.dialogue);
      this.knight.setVelocity(0, 0);
      this.knight.anims.stop();
      this.interactionPrompt.setVisible(false);
      return;
    }

    const exit = academyRoomPoint(400, 416);
    const exitDistance = Phaser.Math.Distance.Between(
      this.knight.x,
      this.knight.y,
      exit.x,
      exit.y
    );
    this.interactionPrompt
      .setText('Press E to return to the courtyard.')
      .setVisible(exitDistance < 68 * ACADEMY_ROOM_SCALE);

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) &&
        exitDistance < 68 * ACADEMY_ROOM_SCALE) {
      transitionTo(this, 'Academy', { spawn: courtyardPoint(400, 230) });
      return;
    }

    updateKnightMovement(this);
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
    ? [IsometricCourtyardScene]
    : [AcademyScene, AcademyInteriorScene]
});
