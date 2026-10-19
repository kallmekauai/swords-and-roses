const WIDTH = 800;
const HEIGHT = 480;

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

function createKnight(scene, x, y) {
  const knight = scene.physics.add.sprite(x, y, 'omar-down-0');
  knight.setDisplaySize(32, 48);
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
  const speed = 190;
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
  }).setOrigin(0.5).setDepth(20).setVisible(false);
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
    this.cameras.main.setBackgroundColor('#252341');
    createAcademyMap(this);
    this.princess = this.add.sprite(550, 385, 'kauai');

    this.princess.setDisplaySize(48, 64);
    this.princess.setDepth(2);
    this.dialogueActive = false;
    this.dialogueIndex = 0;
    this.transitioning = false;

    this.add.text(400, 18, 'CHAPTER I — WRITTEN IN THE STARS', {
      fontFamily: 'Georgia', fontSize: '22px', color: '#fff0d7'
    }).setOrigin(0.5);

    const spawn = data.spawn || { x: 400, y: 385 };
    this.knight = createKnight(this, spawn.x, spawn.y);
    this.physics.add.collider(this.knight, this.solidObstacles);
    this.interactionPrompt = createInteractionPrompt(this);
    this.cameras.main.fadeIn(250, 0, 0, 0);

    this.star = this.add.star(650, 385, 5, 9, 18, 0xffd86d);
    this.tweens.add({ targets: this.star, y: 374, duration: 800, yoyo: true, repeat: -1 });
    this.completed = false;
  }

  update() {
    if (this.transitioning) return;

    const entranceDistance = Phaser.Math.Distance.Between(
      this.knight.x,
      this.knight.y,
      this.castleEntrance.x,
      this.castleEntrance.y
    );
    this.interactionPrompt
      .setText('Press E to enter the Royal Academy.')
      .setVisible(!this.dialogueActive && entranceDistance < this.castleEntrance.radius);

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      if (this.dialogueActive) {
        this.dialogueIndex++;
        this.showDialogueLine();
        return;
      }

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
    this.dialogueActive = true;
    this.dialogueIndex = 0;
    this.showDialogueLine();
  }
  showDialogueLine() {
    const box = document.getElementById("dialogue-box");

    if (this.dialogueIndex >= kauaiDialogue.length) {
      this.dialogueActive = false;
      box.classList.add("hidden");
      return;
    }

    const line = kauaiDialogue[this.dialogueIndex];

    document.getElementById("speaker-name").textContent =
      line.speaker;

    document.getElementById("dialogue-text").textContent =
      line.text;

    box.classList.remove("hidden");
  }

} // End of AcademyScene class

class AcademyInteriorScene extends Phaser.Scene {
  constructor() { super('AcademyInterior'); }

  create(data = {}) {
    createOmarAnimations(this);
    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);
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

    this.add.text(400, 26, 'THE ROYAL ACADEMY', {
      fontFamily: 'Georgia', fontSize: '20px', color: '#fff0d7'
    }).setOrigin(0.5).setDepth(2);

    this.solidObstacles = this.physics.add.staticGroup();
    const addObstacle = (x, y, width, height) => {
      const obstacle = this.add.rectangle(x, y, width, height);
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
    this.knight = createKnight(this, spawn.x, spawn.y);
    this.physics.add.collider(this.knight, this.solidObstacles);
    this.interactionPrompt = createInteractionPrompt(this);
    this.transitioning = false;
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  update() {
    if (this.transitioning) return;

    const exitDistance = Phaser.Math.Distance.Between(
      this.knight.x,
      this.knight.y,
      400,
      416
    );
    this.interactionPrompt
      .setText('Press E to return to the courtyard.')
      .setVisible(exitDistance < 68);

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && exitDistance < 68) {
      transitionTo(this, 'Academy', { spawn: { x: 400, y: 180 } });
      return;
    }

    updateKnightMovement(this);
  }
}


const debugCollisions =
  new URLSearchParams(window.location.search).get('debugCollisions') === '1';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: debugCollisions,
      debugShowBody: debugCollisions,
      debugShowStaticBody: debugCollisions,
      debugShowVelocity: false
    }
  },
  scene: [AcademyScene, AcademyInteriorScene]
});
