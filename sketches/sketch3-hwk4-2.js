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

  function wCol(pr) {
    if (pr < 0.5) return p.lerpColor(p.color(80,190,110), p.color(230,180,50), pr/0.5);
    if (pr < 0.8) return p.lerpColor(p.color(230,180,50), p.color(220,65,50), (pr-0.5)/0.3);
    return p.color(220, 65, 50);
  }

  function fmt(ms) {
    if (ms <= 0) return 'DUE!';
    let s = Math.ceil(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
    if (h > 0) return h + 'h ' + p.nf(m % 60, 2) + 'm';
    return (m % 60) + ':' + p.nf(s % 60, 2);
  }

  function drawClock(i) {
    let c = clocks[i], rm = rem(c), pr = prog(c), rr = 1 - pr;

    // outer ring
    p.push(); p.translate(c.cx, c.cy);
    let rc = wCol(pr); rc.setAlpha(40);
    p.fill(rc); p.stroke(wCol(pr)); p.strokeWeight(2);
    p.ellipse(0, 0, r * 2 + 12, r * 2 + 12);
    p.pop();

    // grey bg
    p.push(); p.translate(c.cx, c.cy);
    p.fill(225); p.noStroke();
    p.ellipse(0, 0, r * 2, r * 2);
    p.pop();

    // colored wedge
    if (rr > 0.001) {
      p.push(); p.translate(c.cx, c.cy);
      p.fill(wCol(pr)); p.noStroke();
      p.arc(0, 0, r * 2, r * 2, -p.HALF_PI - rr * p.TWO_PI, -p.HALF_PI);
      p.pop();
    }

    // white inner
    let ir = r * 0.7;
    p.push(); p.translate(c.cx, c.cy);
    p.fill(255); p.noStroke();
    p.ellipse(0, 0, ir * 2, ir * 2);
    p.pop();

    // ticks
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

    // hand pointing to wedge edge
    let ha = rm <= 0 ? -p.HALF_PI : -p.HALF_PI - rr * p.TWO_PI;
    p.push(); p.translate(c.cx, c.cy);
    p.rotate(ha + p.HALF_PI);
    p.stroke(50); p.strokeWeight(3); p.strokeCap(p.ROUND);
    p.line(0, 0, 0, -r * 0.72);
    p.fill(50); p.noStroke();
    p.triangle(-3, -r * 0.68, 3, -r * 0.68, 0, -r * 0.78);
    p.pop();

    // red 12-o'clock deadline marker
    p.push(); p.translate(c.cx, c.cy);
    p.fill(220, 50, 50); p.noStroke();
    p.triangle(-5, -r * 0.82, 5, -r * 0.82, 0, -r * 0.72);
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
    p.fill(150); p.textSize(11);
    p.text('hand sweeps to red triangle = deadline', 400, 90);

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

    p.fill(150); p.textSize(11);
    p.text('wedge = time left \u00b7 hand sweeps to red triangle = deadline', 400, 620);
    let ly = 650;
    p.noStroke(); p.textSize(10);
    p.fill(80,190,110); p.rect(280,ly,12,12,3); p.fill(80); p.text('>50%',314,ly+6);
    p.fill(230,180,50);  p.rect(350,ly,12,12,3); p.fill(80); p.text('20\u201350%',392,ly+6);
    p.fill(220,65,50);   p.rect(430,ly,12,12,3); p.fill(80); p.text('<20%',462,ly+6);

    p.noFill(); p.stroke(0); p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
});