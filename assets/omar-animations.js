
function createOmarAnimations(scene) {
  const directions = ["down", "up", "left", "right"];

  directions.forEach(direction => {
    if (scene.anims.exists(`walk-${direction}`)) return;

    for (let frame = 0; frame < 4; frame++) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 48;

      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      function pixel(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
      }

      const skin = "#a56b49";
      const hair = "#211c25";
      const armor = "#b8c4d4";
      const shadow = "#79869a";
      const cape = "#254b86";
      const gold = "#e4d6a5";
      const boots = "#302638";

      // Alternate legs to simulate footsteps.
      const step = frame === 1 ? 2 : frame === 3 ? -2 : 0;
      const bob = frame === 1 || frame === 3 ? 1 : 0;

      // Blue cape
      pixel(5, 19 + bob, 22, 24, cape);

      // Legs and boots
      pixel(8, 32, 7, 9 + step, shadow);
      pixel(18, 32, 7, 9 - step, shadow);
      pixel(7, 39 + step, 8, 7, boots);
      pixel(18, 39 - step, 8, 7, boots);

      // Arms and armor
      pixel(3, 20 + bob, 6, 15, shadow);
      pixel(24, 20 + bob, 6, 15, shadow);
      pixel(8, 19 + bob, 17, 16, armor);
      pixel(14, 20 + bob, 5, 12, gold);
      pixel(8, 33 + bob, 17, 4, shadow);

      // Face and hair
      pixel(10, 7 + bob, 13, 13, skin);

      if (direction === "down") {
        pixel(11, 13 + bob, 3, 2, hair);
        pixel(19, 13 + bob, 3, 2, hair);
      }

      if (direction === "up") {
        // Back of Omar's head
        pixel(9, 7 + bob, 15, 13, hair);
      }

      if (direction === "left") {
        pixel(10, 13 + bob, 3, 2, hair);
        pixel(9, 16 + bob, 3, 2, skin);
      }

      if (direction === "right") {
        pixel(20, 13 + bob, 3, 2, hair);
        pixel(22, 16 + bob, 3, 2, skin);
      }

      // Hair
      pixel(8, 4 + bob, 17, 6, hair);

      // Shoulder plates
      pixel(3, 19 + bob, 7, 5, "#d5dce5");
      pixel(23, 19 + bob, 7, 5, "#d5dce5");

      const key = `omar-${direction}-${frame}`;

      scene.textures.addCanvas(key, canvas);
    }

    scene.anims.create({
      key: `walk-${direction}`,
      frames: [0, 1, 2, 3].map(frame => ({
        key: `omar-${direction}-${frame}`
      })),
      frameRate: 8,
      repeat: -1
    });
  });
}
