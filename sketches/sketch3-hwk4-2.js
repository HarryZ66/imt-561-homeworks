registerSketch('sk3', function (p) {
  const CANVAS_SIZE = 800;
  const clocks = [
    { cx:200, cy:350, name:'Design' },
    { cx:400, cy:350, name:'Review' },
    { cx:600, cy:350, name:'Deploy' },
  ];
  const r = 110;

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.textFont('sans-serif');
  };

  function drawClock(i) {
    let c = clocks[i];

    // white face
    p.push(); p.translate(c.cx, c.cy);
    p.fill(255); p.stroke(180); p.strokeWeight(1.5);
    p.ellipse(0, 0, r * 2, r * 2);

    // 12 tick marks
    for (let h = 0; h < 12; h++) {
      let a = (h / 12) * p.TWO_PI - p.HALF_PI;
      let main = h % 3 === 0;
      p.stroke(main ? 80 : 180);
      p.strokeWeight(main ? 2.5 : 1);
      p.line(
        p.cos(a) * r * 0.82, p.sin(a) * r * 0.82,
        p.cos(a) * r * 0.98, p.sin(a) * r * 0.98
      );
    }

    // center dot
    p.fill(60); p.noStroke();
    p.ellipse(0, 0, 8, 8);
    p.pop();

    // name label
    p.push(); p.noStroke(); p.fill(100);
    p.textSize(12); p.textAlign(p.CENTER, p.CENTER);
    p.text(c.name, c.cx, c.cy + r + 20);
    p.pop();
  }

  p.draw = function () {
    p.background(245);

    // title
    p.noStroke(); p.fill(30);
    p.textSize(24); p.textStyle(p.BOLD); p.textAlign(p.CENTER, p.CENTER);
    p.text('Work Clock', 400, 46);
    p.fill(120); p.textSize(12); p.textStyle(p.NORMAL);
    p.text('office — task deadline tracker', 400, 70);

    for (let i = 0; i < 3; i++) drawClock(i);

    // current time
    p.noStroke(); p.fill(80);
    p.textSize(11); p.textAlign(p.CENTER, p.CENTER);
    p.text('Current Time', 400, 530);
    p.fill(30); p.textSize(28); p.textStyle(p.BOLD);
    p.text(
      p.nf(p.hour(), 2) + ':' + p.nf(p.minute(), 2) + ':' + p.nf(p.second(), 2),
      400, 558
    );

    // border
    p.noFill(); p.stroke(0); p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
});