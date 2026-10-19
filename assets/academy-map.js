const COURTYARD_WORLD_WIDTH = 2560;
const COURTYARD_WORLD_HEIGHT = 1440;
const COURTYARD_ORIGIN_X = 800;
const COURTYARD_ORIGIN_Y = 480;
const ACADEMY_MAP_ART_WIDTH = 800;
const ACADEMY_MAP_ART_HEIGHT = 480;

function createAcademyMap(scene) {
  const ground = scene.add.graphics();
  const architecture = scene.add.graphics();
  const gardenCanopy = scene.add.graphics();
  const worldGround = scene.add.graphics();
  const worldLandscaping = scene.add.graphics();

  const colors = {
    grass: 0x769b67,
    grassLight: 0x8eae75,
    grassDark: 0x62865c,
    path: 0xb7aa9e,
    pathLight: 0xd9cbbb,
    pathDark: 0x92877f,
    ivory: 0xf1ead9,
    stoneLight: 0xfff9e9,
    stoneMid: 0xd8d0c2,
    stoneShade: 0xa9a7af,
    stoneDark: 0x777c91,
    sapphire: 0x315b9a,
    sapphireLight: 0x729bd0,
    sapphireDark: 0x203d70,
    gold: 0xd8b866,
    goldLight: 0xf4dc91,
    rose: 0xd86d98,
    roseLight: 0xf5a6bd,
    leaf: 0x426e4d,
    leafLight: 0x79a766
  };

  function fillRect(graphics, color, x, y, width, height) {
    graphics.fillStyle(color, 1);
    graphics.fillRect(x, y, width, height);
  }

  function drawPath(x, y, width, height) {
    fillRect(ground, colors.pathDark, x, y, width, height);
    fillRect(ground, colors.path, x + 2, y, width - 4, height - 2);
    fillRect(ground, colors.pathLight, x + 3, y + 2, width - 6, 3);

    for (let row = 0, stoneY = y + 8; stoneY < y + height - 7; row++, stoneY += 16) {
      const offset = row % 2 === 0 ? 0 : 14;
      for (let stoneX = x + 4 + offset; stoneX < x + width - 12; stoneX += 28) {
        fillRect(ground, colors.pathDark, stoneX, stoneY, 25, 12);
        fillRect(ground, colors.pathLight, stoneX + 1, stoneY, 23, 2);
        fillRect(ground, colors.path, stoneX + 1, stoneY + 3, 23, 8);
      }
    }
  }

  function drawWindow(x, y, width, height) {
    const archHeight = Math.floor(width / 2);
    architecture.fillStyle(colors.stoneDark);
    architecture.fillRoundedRect(x - 3, y - 3, width + 6, height + 8, archHeight + 3);
    architecture.fillStyle(colors.gold);
    architecture.fillRoundedRect(x, y, width, height + 4, archHeight);
    architecture.fillStyle(colors.sapphireDark);
    architecture.fillRoundedRect(x + 3, y + 3, width - 6, height - 2, archHeight - 2);
    architecture.fillStyle(colors.sapphire);
    architecture.fillRect(x + 6, y + archHeight, width - 12, height - archHeight - 2);
    architecture.fillStyle(colors.sapphireLight);
    architecture.fillRect(x + 7, y + archHeight + 2, 3, height - archHeight - 6);
    architecture.fillRect(x + 12, y + 5, 2, Math.max(4, height - 15));
    architecture.fillStyle(colors.goldLight);
    architecture.fillRect(x + Math.floor(width / 2) - 1, y + archHeight, 2, height - archHeight);
    architecture.fillRect(x + 4, y + archHeight + 3, width - 8, 2);
  }

  function drawTower(x, width, baseY, roofPeakY) {
    const center = x + width / 2;
    const bodyTop = roofPeakY + 34;
    const bodyHeight = baseY - bodyTop;

    fillRect(architecture, colors.stoneDark, x - 5, bodyTop + 4, width + 10, bodyHeight);
    fillRect(architecture, colors.ivory, x, bodyTop, width, bodyHeight);
    fillRect(architecture, colors.stoneLight, x + 5, bodyTop + 4, width - 10, bodyHeight - 5);
    fillRect(architecture, colors.stoneMid, x + width - 9, bodyTop + 5, 9, bodyHeight - 6);

    for (let trimY = bodyTop + 13; trimY < baseY - 2; trimY += 28) {
      fillRect(architecture, colors.stoneMid, x + 4, trimY, width - 8, 3);
      fillRect(architecture, colors.stoneLight, x + 5, trimY, width - 10, 1);
    }

    fillRect(architecture, colors.stoneDark, x - 7, bodyTop - 3, width + 14, 9);
    fillRect(architecture, colors.stoneLight, x - 5, bodyTop - 3, width + 10, 5);
    for (let merlonX = x - 2; merlonX < x + width; merlonX += 15) {
      fillRect(architecture, colors.stoneLight, merlonX, bodyTop - 11, 8, 9);
      fillRect(architecture, colors.stoneMid, merlonX + 6, bodyTop - 10, 2, 8);
    }

    architecture.fillStyle(colors.sapphireDark);
    architecture.fillTriangle(x - 8, bodyTop + 1, center, roofPeakY, x + width + 8, bodyTop + 1);
    architecture.fillStyle(colors.sapphire);
    architecture.fillTriangle(x, bodyTop - 1, center, roofPeakY + 7, x + width, bodyTop - 1);
    architecture.fillStyle(colors.sapphireLight);
    architecture.fillTriangle(x + 9, bodyTop - 1, center, roofPeakY + 14, center - 1, bodyTop - 1);
    fillRect(architecture, colors.sapphireDark, x - 7, bodyTop - 2, width + 14, 5);
    fillRect(architecture, colors.gold, x - 7, bodyTop + 1, width + 14, 3);

    for (let roofY = roofPeakY + 24; roofY < bodyTop - 4; roofY += 12) {
      const inset = Math.floor((roofY - roofPeakY) * width / (2 * (bodyTop - roofPeakY)));
      fillRect(architecture, colors.sapphireLight, x + inset + 3, roofY, Math.max(3, width - inset * 2 - 6), 2);
    }

    drawWindow(center - 13, bodyTop + 21, 26, 48);
    fillRect(architecture, colors.gold, center - 2, roofPeakY - 6, 4, 10);
    fillRect(architecture, colors.goldLight, center - 1, roofPeakY - 11, 2, 7);
    fillRect(architecture, colors.gold, center - 1, roofPeakY - 17, 2, 7);
    fillRect(architecture, colors.goldLight, center - 4, roofPeakY - 9, 8, 2);
  }

  function drawHedge(x, y, width, height, foreground = false) {
    const graphics = foreground ? gardenCanopy : architecture;
    graphics.fillStyle(colors.leaf);
    graphics.fillRoundedRect(x, y + 5, width, height - 3, Math.floor(height / 3));
    graphics.fillStyle(colors.leafLight);
    graphics.fillRoundedRect(x + 3, y, width - 6, height - 7, Math.floor(height / 3));

    for (let leafX = x + 8; leafX < x + width - 5; leafX += 15) {
      graphics.fillStyle(colors.grassDark);
      graphics.fillRect(leafX, y + 6, 5, 3);
      graphics.fillStyle(colors.leafLight);
      graphics.fillRect(leafX + 2, y + 2, 3, 3);
    }
  }

  function drawRoseBed(x, y, width, height) {
    ground.fillStyle(0x59664b);
    ground.fillRoundedRect(x, y, width, height, 8);
    ground.fillStyle(0x8d624f);
    ground.fillRoundedRect(x + 4, y + 4, width - 8, height - 8, 5);
    for (let roseX = x + 12; roseX < x + width - 8; roseX += 18) {
      for (let roseY = y + 11; roseY < y + height - 5; roseY += 16) {
        ground.fillStyle(colors.leaf);
        ground.fillRect(roseX - 2, roseY + 3, 5, 5);
        ground.fillStyle(colors.rose);
        ground.fillRect(roseX - 3, roseY - 2, 6, 5);
        ground.fillStyle(colors.roseLight);
        ground.fillRect(roseX - 1, roseY - 2, 2, 2);
      }
    }
  }

  function drawLantern(x, y) {
    fillRect(architecture, colors.stoneDark, x - 5, y + 8, 10, 19);
    fillRect(architecture, colors.gold, x - 8, y + 5, 16, 4);
    fillRect(architecture, colors.goldLight, x - 5, y - 5, 10, 12);
    fillRect(architecture, colors.gold, x - 7, y - 7, 14, 3);
    fillRect(architecture, colors.gold, x - 4, y - 9, 8, 2);
    fillRect(architecture, 0xffe7a0, x - 2, y - 3, 4, 8);
  }

  ground.setDepth(0);
  architecture.setDepth(1);
  gardenCanopy.setDepth(3);

  worldGround.setDepth(-2);
  worldGround.fillStyle(colors.grass, 1);
  worldGround.fillRect(0, 0, COURTYARD_WORLD_WIDTH, COURTYARD_WORLD_HEIGHT);
  for (let y = 24; y < COURTYARD_WORLD_HEIGHT; y += 48) {
    for (let x = (Math.floor(y / 48) % 2) * 23 + 16; x < COURTYARD_WORLD_WIDTH; x += 46) {
      worldGround.fillStyle((x + y) % 4 === 0 ? colors.grassLight : colors.grassDark, 0.6);
      worldGround.fillRect(x, y, 4, 3);
      worldGround.fillRect(x + 7, y + 6, 2, 2);
    }
  }

  worldLandscaping.setDepth(-1);
  worldLandscaping.fillStyle(colors.pathDark, 1);
  worldLandscaping.fillRect(0, COURTYARD_ORIGIN_Y + 322, COURTYARD_ORIGIN_X + 92, 64);
  worldLandscaping.fillRect(
    COURTYARD_ORIGIN_X + 708,
    COURTYARD_ORIGIN_Y + 322,
    COURTYARD_WORLD_WIDTH - COURTYARD_ORIGIN_X - 708,
    64
  );
  worldLandscaping.fillRect(
    COURTYARD_ORIGIN_X + 350,
    COURTYARD_ORIGIN_Y + ACADEMY_MAP_ART_HEIGHT,
    100,
    COURTYARD_WORLD_HEIGHT - COURTYARD_ORIGIN_Y - ACADEMY_MAP_ART_HEIGHT
  );

  for (const [x, y, width, height] of [
    [120, 250, 680, 44],
    [1600, 250, 660, 44],
    [220, 1040, 620, 40],
    [1560, 1040, 620, 40],
    [400, 294, 44, 508],
    [1956, 294, 44, 508],
    [550, 950, 42, 354],
    [1808, 950, 42, 354]
  ]) {
    worldLandscaping.fillStyle(colors.pathDark, 1);
    worldLandscaping.fillRect(x, y, width, height);
  }

  worldLandscaping.fillStyle(colors.path, 1);
  worldLandscaping.fillRect(0, COURTYARD_ORIGIN_Y + 322, COURTYARD_ORIGIN_X + 92, 60);
  worldLandscaping.fillRect(
    COURTYARD_ORIGIN_X + 708,
    COURTYARD_ORIGIN_Y + 322,
    COURTYARD_WORLD_WIDTH - COURTYARD_ORIGIN_X - 708,
    60
  );
  worldLandscaping.fillRect(
    COURTYARD_ORIGIN_X + 352,
    COURTYARD_ORIGIN_Y + ACADEMY_MAP_ART_HEIGHT,
    96,
    COURTYARD_WORLD_HEIGHT - COURTYARD_ORIGIN_Y - ACADEMY_MAP_ART_HEIGHT
  );
  for (let pathX = 12; pathX < COURTYARD_WORLD_WIDTH; pathX += 34) {
    worldLandscaping.fillStyle(0xd2c6b0, 0.6);
    worldLandscaping.fillRect(pathX, COURTYARD_ORIGIN_Y + 331, 21, 3);
  }
  for (let pathY = COURTYARD_ORIGIN_Y + 488; pathY < COURTYARD_WORLD_HEIGHT; pathY += 28) {
    worldLandscaping.fillStyle(0xd2c6b0, 0.6);
    worldLandscaping.fillRect(COURTYARD_ORIGIN_X + 357, pathY, 3, 17);
    worldLandscaping.fillRect(COURTYARD_ORIGIN_X + 387, pathY + 7, 3, 17);
    worldLandscaping.fillRect(COURTYARD_ORIGIN_X + 417, pathY, 3, 17);
  }

  for (const [x, y, width, height] of [
    [100, 330, 270, 190],
    [185, 875, 270, 125],
    [620, 1110, 290, 205],
    [1670, 325, 260, 170],
    [2020, 885, 330, 130],
    [2050, 1110, 220, 205]
  ]) {
    worldLandscaping.fillStyle(0x537b52, 1);
    worldLandscaping.fillRoundedRect(x, y, width, height, 26);
    worldLandscaping.fillStyle(0x668b5c, 1);
    worldLandscaping.fillRoundedRect(x + 8, y + 8, width - 16, height - 16, 20);
    for (let flowerX = x + 22; flowerX < x + width - 12; flowerX += 32) {
      for (let flowerY = y + 22; flowerY < y + height - 12; flowerY += 30) {
        worldLandscaping.fillStyle((flowerX + flowerY) % 2 ? colors.rose : 0xf2d78b, 1);
        worldLandscaping.fillCircle(flowerX, flowerY, 4);
        worldLandscaping.fillStyle(colors.stoneLight, 1);
        worldLandscaping.fillRect(flowerX + 4, flowerY - 2, 3, 3);
      }
    }
  }

  for (const [x, y] of [
    [170, 610], [690, 585], [1720, 570], [2220, 655],
    [275, 1120], [735, 1275], [1700, 1175], [2220, 1080]
  ]) {
    worldLandscaping.fillStyle(0x315b43, 1);
    worldLandscaping.fillCircle(x, y, 23);
    worldLandscaping.fillStyle(0x79a766, 1);
    worldLandscaping.fillCircle(x - 8, y - 7, 13);
    worldLandscaping.fillStyle(colors.roseLight, 1);
    worldLandscaping.fillCircle(x - 6, y - 9, 3);
    worldLandscaping.fillCircle(x + 9, y - 3, 3);
  }

  ground.setPosition(COURTYARD_ORIGIN_X, COURTYARD_ORIGIN_Y);
  architecture.setPosition(COURTYARD_ORIGIN_X, COURTYARD_ORIGIN_Y);
  gardenCanopy.setPosition(COURTYARD_ORIGIN_X, COURTYARD_ORIGIN_Y);

  fillRect(
    ground,
    colors.grass,
    0,
    0,
    ACADEMY_MAP_ART_WIDTH,
    ACADEMY_MAP_ART_HEIGHT
  );
  for (let y = 12; y < ACADEMY_MAP_ART_HEIGHT; y += 24) {
    for (
      let x = (Math.floor(y / 24) % 2) * 17 + 8;
      x < ACADEMY_MAP_ART_WIDTH;
      x += 34
    ) {
      fillRect(ground, (x + y) % 3 === 0 ? colors.grassLight : colors.grassDark, x, y, 3, 2);
      fillRect(ground, colors.grassLight, x + 5, y + 4, 2, 2);
    }
  }

  drawPath(350, 130, 100, 350);
  drawPath(92, 322, 616, 64);
  drawPath(332, 202, 136, 154);

  drawRoseBed(44, 219, 76, 61);
  drawRoseBed(134, 219, 78, 61);
  drawRoseBed(588, 219, 78, 61);
  drawRoseBed(680, 219, 76, 61);
  drawRoseBed(241, 211, 46, 63);
  drawRoseBed(513, 211, 46, 63);

  ground.fillStyle(0x536f4a);
  ground.fillRoundedRect(270, 278, 60, 22, 8);
  ground.fillStyle(0x79965b);
  ground.fillRoundedRect(274, 275, 52, 18, 7);
  ground.fillStyle(0x536f4a);
  ground.fillRoundedRect(470, 278, 60, 22, 8);
  ground.fillStyle(0x79965b);
  ground.fillRoundedRect(474, 275, 52, 18, 7);

  // A broad ivory stair terrace guides the central path to the open arch.
  fillRect(ground, colors.stoneDark, 346, 181, 108, 29);
  fillRect(ground, colors.stoneMid, 350, 179, 100, 24);
  fillRect(ground, colors.stoneLight, 352, 180, 96, 5);
  fillRect(ground, colors.gold, 353, 201, 94, 2);
  fillRect(ground, colors.stoneDark, 358, 207, 84, 8);
  fillRect(ground, colors.stoneMid, 360, 205, 80, 6);
  fillRect(ground, colors.stoneLight, 361, 205, 78, 2);

  // The palace is assembled as separate masonry wings, towers, roofs, and trim.
  fillRect(architecture, colors.stoneDark, 188, 80, 424, 116);
  fillRect(architecture, colors.ivory, 194, 75, 412, 117);
  fillRect(architecture, colors.stoneLight, 201, 80, 398, 107);
  fillRect(architecture, colors.stoneMid, 201, 180, 398, 10);
  fillRect(architecture, colors.gold, 196, 190, 408, 4);
  fillRect(architecture, colors.goldLight, 201, 190, 398, 2);

  for (let blockX = 207; blockX < 594; blockX += 31) {
    fillRect(architecture, colors.stoneMid, blockX, 91, 2, 78);
    fillRect(architecture, colors.stoneLight, blockX + 2, 92, 1, 76);
  }
  for (let bandY = 104; bandY < 180; bandY += 25) {
    fillRect(architecture, colors.stoneMid, 202, bandY, 397, 2);
    fillRect(architecture, colors.stoneLight, 204, bandY + 2, 393, 1);
  }

  // Side pavilions and upper central hall give the facade depth.
  fillRect(architecture, colors.stoneDark, 264, 64, 272, 91);
  fillRect(architecture, colors.ivory, 270, 60, 260, 93);
  fillRect(architecture, colors.stoneLight, 278, 67, 244, 79);
  fillRect(architecture, colors.stoneMid, 278, 140, 244, 9);
  fillRect(architecture, colors.gold, 267, 151, 266, 5);
  fillRect(architecture, colors.goldLight, 274, 151, 252, 2);
  architecture.fillStyle(colors.stoneDark);
  architecture.fillTriangle(258, 64, 400, 15, 542, 64);
  architecture.fillStyle(colors.ivory);
  architecture.fillTriangle(270, 62, 400, 22, 530, 62);
  architecture.fillStyle(colors.stoneLight);
  architecture.fillTriangle(289, 58, 400, 27, 511, 58);
  fillRect(architecture, colors.stoneMid, 270, 60, 260, 5);
  fillRect(architecture, colors.gold, 278, 65, 244, 3);
  fillRect(architecture, colors.goldLight, 286, 69, 228, 2);

  for (const x of [292, 486]) {
    fillRect(architecture, colors.stoneDark, x - 5, 86, 38, 66);
    fillRect(architecture, colors.stoneLight, x, 82, 28, 68);
    fillRect(architecture, colors.stoneMid, x + 21, 85, 7, 64);
    fillRect(architecture, colors.gold, x - 3, 83, 34, 4);
    drawWindow(x + 3, 94, 20, 43);
  }

  // A recessed, open double-door arch keeps the central approach walkable.
  architecture.fillStyle(colors.stoneDark);
  architecture.fillRoundedRect(355, 123, 90, 79, 44);
  architecture.fillStyle(colors.gold);
  architecture.fillRoundedRect(360, 127, 80, 76, 39);
  architecture.fillStyle(0x302c43);
  architecture.fillRoundedRect(365, 132, 70, 72, 34);
  architecture.fillStyle(0x17243a);
  architecture.fillRect(372, 163, 56, 41);
  architecture.fillStyle(0x46334d);
  architecture.fillTriangle(372, 163, 400, 137, 428, 163);
  fillRect(architecture, colors.gold, 367, 158, 5, 45);
  fillRect(architecture, colors.gold, 428, 158, 5, 45);
  fillRect(architecture, colors.goldLight, 369, 156, 2, 43);
  fillRect(architecture, colors.goldLight, 429, 156, 2, 43);
  fillRect(architecture, colors.sapphire, 375, 165, 11, 34);
  fillRect(architecture, colors.sapphireLight, 376, 166, 3, 12);
  fillRect(architecture, colors.gold, 385, 165, 2, 34);
  fillRect(architecture, colors.sapphire, 414, 165, 11, 34);
  fillRect(architecture, colors.sapphireLight, 415, 166, 3, 12);
  fillRect(architecture, colors.gold, 413, 165, 2, 34);
  fillRect(architecture, colors.goldLight, 393, 151, 14, 3);
  fillRect(architecture, colors.gold, 397, 145, 6, 10);
  fillRect(architecture, colors.stoneLight, 352, 199, 96, 4);

  for (const x of [246, 540]) {
    fillRect(architecture, colors.stoneDark, x - 8, 111, 24, 81);
    fillRect(architecture, colors.stoneLight, x - 5, 107, 18, 83);
    fillRect(architecture, colors.stoneMid, x + 7, 110, 6, 79);
    fillRect(architecture, colors.gold, x - 9, 107, 26, 4);
    fillRect(architecture, colors.stoneLight, x - 9, 101, 26, 7);
    fillRect(architecture, colors.gold, x - 12, 99, 32, 3);
  }

  drawWindow(379, 75, 42, 62);
  drawWindow(214, 111, 28, 54);
  drawWindow(558, 111, 28, 54);
  drawTower(202, 70, 180, 8);
  drawTower(528, 70, 180, 8);

  // A balcony, balustrade, and jewel details sit above the doorway.
  fillRect(architecture, colors.stoneDark, 336, 144, 128, 8);
  fillRect(architecture, colors.stoneLight, 340, 142, 120, 5);
  fillRect(architecture, colors.gold, 341, 147, 118, 2);
  fillRect(architecture, colors.stoneLight, 347, 133, 5, 12);
  fillRect(architecture, colors.stoneLight, 359, 133, 5, 12);
  fillRect(architecture, colors.stoneLight, 371, 133, 5, 12);
  fillRect(architecture, colors.stoneLight, 424, 133, 5, 12);
  fillRect(architecture, colors.stoneLight, 436, 133, 5, 12);
  fillRect(architecture, colors.stoneLight, 448, 133, 5, 12);
  fillRect(architecture, colors.gold, 397, 47, 6, 18);
  fillRect(architecture, colors.goldLight, 399, 39, 2, 10);
  fillRect(architecture, colors.gold, 398, 31, 4, 8);
  fillRect(architecture, colors.goldLight, 394, 44, 12, 2);
  fillRect(architecture, colors.sapphire, 396, 54, 8, 7);

  // Rose trellises climb the outer wings without obscuring the doorway.
  for (const side of [0, 1]) {
    const x = side === 0 ? 276 : 507;
    fillRect(architecture, colors.leaf, x, 158, 4, 31);
    fillRect(architecture, colors.leafLight, x + 6, 164, 3, 25);
    for (const roseY of [160, 171, 182]) {
      architecture.fillStyle(colors.rose);
      architecture.fillRect(x - 3, roseY, 7, 5);
      architecture.fillStyle(colors.roseLight);
      architecture.fillRect(x - 1, roseY, 3, 2);
      architecture.fillStyle(colors.leafLight);
      architecture.fillRect(x + 4, roseY + 3, 4, 3);
    }
  }

  // The central fountain retains its collision footprint and gets layered stonework.
  ground.fillStyle(colors.stoneDark);
  ground.fillCircle(400, 347, 39);
  ground.fillStyle(colors.stoneLight);
  ground.fillCircle(400, 343, 35);
  ground.fillStyle(colors.stoneMid);
  ground.fillCircle(400, 346, 28);
  ground.fillStyle(colors.sapphire);
  ground.fillCircle(400, 344, 22);
  ground.fillStyle(colors.sapphireLight);
  ground.fillCircle(393, 338, 6);
  ground.fillStyle(colors.gold);
  ground.fillCircle(400, 344, 8);
  ground.fillStyle(colors.stoneLight);
  ground.fillCircle(400, 343, 4);
  ground.fillStyle(colors.sapphireLight);
  ground.fillRect(397, 326, 6, 16);
  ground.fillStyle(colors.stoneLight);
  ground.fillRect(391, 325, 18, 4);
  ground.fillStyle(colors.gold);
  ground.fillRect(395, 322, 10, 3);
  ground.fillStyle(colors.sapphireLight);
  ground.fillCircle(400, 319, 4);
  ground.fillStyle(0xb9e6ef);
  ground.fillCircle(400, 315, 2);

  for (const x of [308, 492]) {
    drawLantern(x, 252);
    ground.fillStyle(colors.goldLight);
    ground.fillCircle(x, 246, 3);
  }

  // Foreground hedges frame the path; gaps preserve access to the courtyard walk.
  drawHedge(34, 298, 241, 22);
  drawHedge(525, 298, 241, 22);
  drawHedge(28, 230, 15, 64);
  drawHedge(757, 230, 15, 64);
  drawHedge(47, 391, 176, 24, true);
  drawHedge(700, 391, 62, 24, true);

  scene.castleEntrance = {
    x: COURTYARD_ORIGIN_X + 400,
    y: COURTYARD_ORIGIN_Y + 180,
    radius: 68
  };
  scene.physics.world.setBounds(0, 0, COURTYARD_WORLD_WIDTH, COURTYARD_WORLD_HEIGHT);
  scene.solidObstacles = scene.physics.add.staticGroup();

  function addSolidRectangle(x, y, width, height) {
    const obstacle = scene.add.rectangle(
      COURTYARD_ORIGIN_X + x,
      COURTYARD_ORIGIN_Y + y,
      width,
      height
    );
    scene.physics.add.existing(obstacle, true);
    obstacle.setVisible(false);
    scene.solidObstacles.add(obstacle);
  }

  function addSolidCircle(x, y, radius) {
    const obstacle = scene.add.circle(x, y, radius);
    scene.physics.add.existing(obstacle, true);
    obstacle.body.setCircle(radius);
    obstacle.setVisible(false);
    scene.solidObstacles.add(obstacle);
  }

  // Keep the entrance gap clear; the colliders follow the visible palace footprint.
  addSolidRectangle(400, 78, 396, 116);
  addSolidRectangle(281, 164, 158, 56);
  addSolidRectangle(519, 164, 158, 56);
  addSolidRectangle(237, 158, 28, 44);
  addSolidRectangle(563, 158, 28, 44);

  // Solid hedge runs leave a broad central and cross-courtyard path open.
  addSolidRectangle(154.5, 309, 241, 22);
  addSolidRectangle(645.5, 309, 241, 22);
  addSolidRectangle(35.5, 262, 15, 64);
  addSolidRectangle(764.5, 262, 15, 64);
  addSolidRectangle(135, 403, 176, 18);
  addSolidRectangle(731, 403, 62, 18);
  for (const [x, y, width, height] of [
    [100, 330, 270, 190],
    [185, 875, 270, 125],
    [620, 1110, 290, 205],
    [1670, 325, 260, 170],
    [2020, 885, 330, 130],
    [2050, 1110, 220, 205]
  ]) {
    addSolidRectangle(x + 8, y + 8, width - 16, height - 16);
  }
  for (const [x, y] of [
    [170, 610], [690, 585], [1720, 570], [2220, 655],
    [275, 1120], [735, 1275], [1700, 1175], [2220, 1080]
  ]) {
    addSolidCircle(x, y, 14);
  }

  const fountain = scene.add.circle(
    COURTYARD_ORIGIN_X + 400,
    COURTYARD_ORIGIN_Y + 347,
    35
  );
  scene.physics.add.existing(fountain, true);
  fountain.body.setCircle(35);
  fountain.setVisible(false);
  scene.solidObstacles.add(fountain);
}
