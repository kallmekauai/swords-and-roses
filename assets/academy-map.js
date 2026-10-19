
function createAcademyMap(scene) {
  const map = scene.add.graphics();

  // Grass covering the courtyard
  map.fillStyle(0x769b67);
  map.fillRect(0, 0, 800, 480);

  // Main stone pathway
  map.fillStyle(0xc9b9a1);
  map.fillRect(360, 100, 80, 380);

  // Horizontal pathway
  map.fillRect(100, 300, 600, 65);

  // Castle building
  map.fillStyle(0x827b91);
  map.fillRect(245, 20, 310, 135);

  // Castle roof
  map.fillStyle(0x9c627d);
  map.fillTriangle(230, 30, 570, 30, 400, 0);

  // Castle entrance
  map.fillStyle(0x42364e);
  map.fillRoundedRect(370, 100, 60, 55, 20);

  // Left garden
  map.fillStyle(0x537b52);
  map.fillRoundedRect(80, 180, 170, 95, 15);

  // Right garden
  map.fillRoundedRect(550, 180, 170, 95, 15);

  // Decorative flowers
  for (let i = 0; i < 12; i++) {
    const x = 100 + (i % 4) * 38;
    const y = 195 + Math.floor(i / 4) * 28;

    map.fillStyle(0xf3a9c5);
    map.fillCircle(x, y, 6);
    map.fillCircle(x + 450, y, 6);
  }

  // Fountain
  map.fillStyle(0xb9b5c8);
  map.fillCircle(400, 330, 38);

  map.fillStyle(0x75c5d5);
  map.fillCircle(400, 330, 29);

  map.fillStyle(0xe9d9f2);
  map.fillCircle(400, 330, 9);

scene.physics.world.setBounds(0, 0, 800, 480);
scene.solidObstacles = scene.physics.add.staticGroup();

function addSolidRectangle(x, y, width, height) {
  const obstacle = scene.add.rectangle(x, y, width, height);
  scene.physics.add.existing(obstacle, true);
  obstacle.setVisible(false);
  scene.solidObstacles.add(obstacle);
}

// The doorway remains open between the two front facade sections.
addSolidRectangle(400, 60, 310, 80);
addSolidRectangle(307.5, 127.5, 125, 55);
addSolidRectangle(492.5, 127.5, 125, 55);

const fountain = scene.add.circle(400, 330, 38);
scene.physics.add.existing(fountain, true);
fountain.body.setCircle(38);
fountain.setVisible(false);
scene.solidObstacles.add(fountain);

return map;
}
