const WIDTH = 800;
const HEIGHT = 480;

class AcademyScene extends Phaser.Scene {
  constructor() { super('Academy'); }

  create() {
    this.cameras.main.setBackgroundColor('#252341');
    const graphics = this.add.graphics();
    graphics.fillStyle(0x355448).fillRect(0, 330, WIDTH, 150);
    graphics.fillStyle(0x7e668b).fillRect(225, 145, 350, 190);
    graphics.fillStyle(0xbda1bd).fillRect(245, 165, 310, 170);
    graphics.fillStyle(0x4a344e).fillTriangle(200, 150, 400, 50, 600, 150);
    graphics.fillStyle(0x563d60).fillRect(365, 260, 70, 75);
    graphics.fillStyle(0xffd787).fillRect(285, 210, 45, 45).fillRect(470, 210, 45, 45);

    this.add.text(400, 18, 'CHAPTER I — WRITTEN IN THE STARS', {
      fontFamily: 'Georgia', fontSize: '22px', color: '#fff0d7'
    }).setOrigin(0.5);

    // Placeholder knight; replace with Omar's sprite sheet later.
    this.knight = this.add.rectangle(400, 385, 26, 38, 0x82b7df);
    this.add.rectangle(400, 362, 18, 17, 0x9c654c);
    this.physics.add.existing(this.knight);
    this.knight.body.setCollideWorldBounds(true);

    this.star = this.add.star(650, 385, 5, 9, 18, 0xffd86d);
    this.tweens.add({ targets: this.star, y: 374, duration: 800, yoyo: true, repeat: -1 });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');
    this.completed = false;
  }

  update() {
    const speed = 190;
    const body = this.knight.body;
    body.setVelocity(0);
    if (this.cursors.left.isDown || this.keys.A.isDown) body.setVelocityX(-speed);
    else if (this.cursors.right.isDown || this.keys.D.isDown) body.setVelocityX(speed);
    if (this.cursors.up.isDown || this.keys.W.isDown) body.setVelocityY(-speed);
    else if (this.cursors.down.isDown || this.keys.S.isDown) body.setVelocityY(speed);
    body.velocity.normalize().scale(speed);

    if (!this.completed && Phaser.Input.Keyboard.JustDown(this.keys.E) &&
        Phaser.Math.Distance.Between(this.knight.x, this.knight.y, this.star.x, this.star.y) < 65) {
      this.completed = true;
      this.star.destroy();
      document.getElementById('message').textContent =
        'Memory Fragment collected! Every great story begins beneath the same sky.';
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  pixelArt: true,
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [AcademyScene]
});
