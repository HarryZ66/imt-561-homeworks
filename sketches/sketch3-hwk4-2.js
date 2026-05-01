registerSketch('sk3', function (p) {
  const CANVAS_SIZE = 800;
  const clocks = [
    { cx:200, cy:350, dl:5*6e4,   unit:'5 MIN', name:'Design' },
    { cx:400, cy:350, dl:5*36e5,  unit:'5 HR',  name:'Review' },
    { cx:600, cy:350, dl:10*36e5, unit:'10 HR', name:'Deploy' },
  ];
  const r = 110;
  const t0 = Date.now();
  clocks.forEach(c => c.end = t0 + c.dl);

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.textFont('sans-serif');
  };

  function rem(c)  { return p.max(0, c.end - Date.now()); }
  function prog(c) { return p.constrain(1 - rem(c) / c.dl, 0, 1); }

  function fmt(ms) {
    if (ms <= 0) return 'DUE!';
    let s = Math.ceil(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
    if (h > 0) return h + 'h ' + p.nf(m % 60, 2) + 'm';
    return (m % 60) + ':' + p.nf(s % 60, 2);
  }

  function drawClock(i) {
    let c = clocks[i], rm = rem(c), pr = prog(c), rr = 1 - pr;

    // grey background (elapsed)
    p.push(); p.translate(c.cx, c.cy);
    p.fill(225); p.noStroke();
    p.ellipse(0, 0, r * 2, r * 2);
    p.pop();

    // green wedge (remaining)
    if (rr > 0.001) {
      p.push(); p.translate(c.cx, c.cy);
      p.fill(80, 190, 110); p.noStroke();
      p.arc(0, 0, r * 2, r * 2, -p.HALF_PI - rr * p.TWO_PI, -p.HALF_PI);
      p.pop();
    }

    // white inner face (donut hole)
    let ir = r * 0.7;
    p.push(); p.translate(c.cx, c.cy);
    p.fill(255); p.noStroke();
    p.ellipse(0, 0, ir * 2, ir * 2);
    p.pop();

    // tick marks
    p.push(); p.translate(c.cx, c.cy);
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
    p.pop();

    // center dot + countdown
    p.push(); p.translate(c.cx, c.cy);
    p.fill(60); p.noStroke(); p.ellipse(0, 0, 8, 8);
    p.fill(255); p.ellipse(0, 0, 3, 3);
    p.fill(rm <= 0 ? p.color(220, 40, 40) : 50);
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD); p.textSize(p.min(ir * 0.38, 20));
    p.text(fmt(rm), 0, ir * 0.15);
    p.pop();

    // labels
    p.push(); p.noStroke(); p.textAlign(p.CENTER, p.CENTER);
    p.fill(100); p.textSize(12); p.textStyle(p.NORMAL);
    p.text(c.name, c.cx, c.cy + r + 20);
    p.fill(80); p.textSize(10);
    p.text(c.unit, c.cx, c.cy - r - 16);
    p.pop();
  }

  p.draw = function () {
    p.background(245);

    p.noStroke(); p.fill(30);
    p.textSize(24); p.textStyle(p.BOLD); p.textAlign(p.CENTER, p.CENTER);
    p.text('Work Clock', 400, 46);
    p.fill(120); p.textSize(12); p.textStyle(p.NORMAL);
    p.text('office — task deadline tracker', 400, 70);

    for (let i = 0; i < 3; i++) drawClock(i);

    p.noStroke(); p.fill(80);
    p.textSize(11); p.textAlign(p.CENTER, p.CENTER);
    p.text('Current Time', 400, 530);
    p.fill(30); p.textSize(28); p.textStyle(p.BOLD);
    p.text(
      p.nf(p.hour(), 2) + ':' + p.nf(p.minute(), 2) + ':' + p.nf(p.second(), 2),
      400, 558
    );

    p.fill(120); p.textSize(11); p.textStyle(p.NORMAL);
    clocks.forEach(c => {
      let d = new Date(c.end);
      p.text(
        c.name + ' due ' + p.nf(d.getHours(), 2) + ':' + p.nf(d.getMinutes(), 2) + ':' + p.nf(d.getSeconds(), 2),
        c.cx, 590
      );
    });

    p.noFill(); p.stroke(0); p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
});
