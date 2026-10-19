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

  create() {
    createOmarAnimations(this);
    this.cameras.main.setBackgroundColor('#252341');
     createAcademyMap(this);
    this.princess = this.add.sprite(550, 385, 'kauai');

this.princess.setDisplaySize(48, 64);
this.princess.setDepth(2);
this.dialogueActive = false;
this.dialogueIndex = 0;
this.dialogueCooldown = false;

    this.add.text(400, 18, 'CHAPTER I — WRITTEN IN THE STARS', {
      fontFamily: 'Georgia', fontSize: '22px', color: '#fff0d7'
    }).setOrigin(0.5);

    
this.knight = this.physics.add.sprite(400, 385, 'omar-down-0');
this.knight.setDisplaySize(32, 48);
this.knight.body.setSize(20, 12);
this.knight.body.setOffset(6, 34);
this.knight.setCollideWorldBounds(true);
this.physics.add.collider(this.knight, this.solidObstacles);
this.interactKey = this.input.keyboard.addKey(
  Phaser.Input.Keyboard.KeyCodes.E
);


    this.star = this.add.star(650, 385, 5, 9, 18, 0xffd86d);
    this.tweens.add({ targets: this.star, y: 374, duration: 800, yoyo: true, repeat: -1 });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');
    this.completed = false;
  }

  update() {
    
if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {

  if (this.dialogueActive) {
    this.dialogueIndex++;
    this.showDialogueLine();
    return;
  }

  const distance = Phaser.Math.Distance.Between(
    this.knight.x,
    this.knight.y,
    this.princess.x,
    this.princess.y
  );

  if (distance < 75) {
    this.startKauaiDialogue();
    return;
  }
}
if (this.dialogueActive) {
  this.knight.setVelocity(0, 0);
  this.knight.anims.stop();
  return;
}
    const speed = 190;
    const body = this.knight.body;
    body.setVelocity(0);
    if (this.cursors.left.isDown || this.keys.A.isDown) body.setVelocityX(-speed);
    else if (this.cursors.right.isDown || this.keys.D.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown || this.keys.W.isDown) body.setVelocityY(-speed);
    else if (this.cursors.down.isDown || this.keys.S.isDown) body.setVelocityY(speed);
    body.velocity.normalize().scale(speed);
    

let direction = null;

if (body.velocity.x < 0) {
  direction = "left";
} else if (body.velocity.x > 0) {
  direction = "right";
} else if (body.velocity.y < 0) {
  direction = "up";
} else if (body.velocity.y > 0) {
  direction = "down";
}

if (direction) {
  this.knight.anims.play(`walk-${direction}`, true);
} else {
  this.knight.anims.stop();
}


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
  scene: [AcademyScene]
});
