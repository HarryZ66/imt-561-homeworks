registerSketch('sk2', function (p) {
  const CANVAS_SIZE = 800;
  const agenda = [
    { label: 'Intro',      minutes: 3,  col: [200, 180, 120] },
    { label: 'Discussion', minutes: 8,  col: [120, 180, 200] },
    { label: 'Wrap up',    minutes: 4,  col: [180, 200, 140] },
    { label: 'Q & A',      minutes: 3,  col: [200, 160, 180] },
  ];
  const totalMinutes = 18;
  const cx = 400, cy = 370, R = 255;
  let slices = [];
  let hoveredSlice = -1;

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.textFont('sans-serif');
    let angle = p.TWO_PI * 0.75;
    agenda.forEach(a => {
      const sweep = (a.minutes / totalMinutes) * p.TWO_PI;
      slices.push({ ...a, start: angle, end: angle + sweep });
      angle += sweep;
    });
  };

  function getSliceAt(px, py) {
    const dx = px - cx, dy = py - cy;
    if (Math.sqrt(dx*dx + dy*dy) > R) return -1;
    let a = Math.atan2(dy, dx);
    if (a < 0) a += p.TWO_PI;
    for (let i = 0; i < slices.length; i++) {
      let s = slices[i].start % p.TWO_PI;
      let e = slices[i].end % p.TWO_PI;
      if (s < 0) s += p.TWO_PI;
      if (e < 0) e += p.TWO_PI;
      if (s < e) { if (a >= s && a < e) return i; }
      else { if (a >= s || a < e) return i; }
    }
    return -1;
  }

  p.draw = function () {
    p.background(248);
    hoveredSlice = getSliceAt(p.mouseX, p.mouseY);

    slices.forEach((sl, i) => {
      let alpha = i === hoveredSlice ? 210 : 140;
      p.fill(sl.col[0], sl.col[1], sl.col[2], alpha);
      p.stroke(i === hoveredSlice ? p.color(120,120,120) : p.color(255));
      p.strokeWeight(2);
      p.arc(cx, cy, R * 2, R * 2, sl.start, sl.end, p.PIE);
    });

    slices.forEach(sl => {
      const mid = (sl.start + sl.end) / 2;
      const lx = cx + Math.cos(mid) * R * 0.65;
      const ly = cy + Math.sin(mid) * R * 0.65;
      p.noStroke(); p.fill(60);
      p.textSize(15); p.textStyle(p.BOLD);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(sl.label, lx, ly);
      p.textSize(12); p.textStyle(p.NORMAL); p.fill(90);
      p.text(sl.minutes + ' min', lx, ly + 20);
    });

    p.fill(255); p.stroke(60); p.strokeWeight(2);
    p.ellipse(cx, cy, 22, 22);
    p.fill(30); p.noStroke();
    p.ellipse(cx, cy, 8, 8);

    p.noStroke(); p.fill(30);
    p.textSize(22); p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Meeting Agenda Clock', cx, 44);
    p.fill(120); p.textSize(12); p.textStyle(p.NORMAL);
    p.text('conference room  ·  team leads  ·  workplace', cx, 68);

    p.noFill(); p.stroke(0); p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
});