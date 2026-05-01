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
  let activeSlice = -1;
  let overrunSlice = -1;

  let countdownSeconds = 0;
  let countdownRunning = false;
  let lastMillis = 0;

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

  function startCountdown(i) {
    activeSlice = i;
    countdownSeconds = agenda[i].minutes * 60;
    countdownRunning = true;
    lastMillis = p.millis();
    overrunSlice = -1;
  }

  function getSliceAt(px, py) {
    const dx = px - cx;
    const dy = py - cy;
    if (Math.sqrt(dx * dx + dy * dy) > R) return -1;

    let a = Math.atan2(dy, dx);
    if (a < 0) a += p.TWO_PI;

    for (let i = 0; i < slices.length; i++) {
      let s = slices[i].start % p.TWO_PI;
      let e = slices[i].end % p.TWO_PI;
      if (s < 0) s += p.TWO_PI;
      if (e < 0) e += p.TWO_PI;
      if (s < e) {
        if (a >= s && a < e) return i;
      } else {
        if (a >= s || a < e) return i;
      }
    }
    return -1;
  }

  p.draw = function () {
    p.background(248);

    if (countdownRunning) {
      const now = p.millis();
      countdownSeconds -= (now - lastMillis) / 1000;
      lastMillis = now;
      if (countdownSeconds <= 0) {
        countdownSeconds = 0;
        countdownRunning = false;
        overrunSlice = activeSlice;
      }
    }

    hoveredSlice = getSliceAt(p.mouseX, p.mouseY);

    // base slices
    slices.forEach((sl, i) => {
      let c = sl.col;
      let alpha = 140;
      if (i === hoveredSlice && i !== activeSlice) alpha = 200;

      p.fill(c[0], c[1], c[2], alpha);
      if (i === overrunSlice)      p.stroke(255, 60, 60);
      else if (i === hoveredSlice) p.stroke(120, 120, 120);
      else                         p.stroke(255);
      p.strokeWeight(2);
      p.arc(cx, cy, R * 2, R * 2, sl.start, sl.end, p.PIE);
    });

    // active slice — used/remaining split
    if (activeSlice >= 0) {
      const sl = slices[activeSlice];
      const c = sl.col;
      const totalSec = agenda[activeSlice].minutes * 60;
      const remainProgress = p.constrain(countdownSeconds / totalSec, 0, 1);
      const usedProgress = 1 - remainProgress;
      const usedEnd = sl.start + usedProgress * (sl.end - sl.start);

      if (usedProgress > 0) {
        p.fill(60, 60, 60, 230);
        p.noStroke();
        p.arc(cx, cy, R * 2, R * 2, sl.start, usedEnd, p.PIE);
      }

      if (remainProgress > 0) {
        p.fill(c[0], c[1], c[2], 240);
        p.noStroke();
        p.arc(cx, cy, R * 2, R * 2, usedEnd, sl.end, p.PIE);
      }

      p.noFill();
      p.stroke(40, 40, 40);
      p.strokeWeight(3);
      p.arc(cx, cy, R * 2, R * 2, sl.start, sl.end, p.PIE);
    }

    // labels
    slices.forEach((sl, i) => {
      const mid = (sl.start + sl.end) / 2;
      const lx = cx + Math.cos(mid) * R * 0.65;
      const ly = cy + Math.sin(mid) * R * 0.65;

      p.noStroke();
      if (i === activeSlice) {
        const totalSec = agenda[activeSlice].minutes * 60;
        const usedProgress = 1 - p.constrain(countdownSeconds / totalSec, 0, 1);
        p.fill(usedProgress > 0.5 ? 255 : 20);
      } else {
        p.fill(60);
      }

      p.textSize(i === activeSlice ? 18 : 15);
      p.textStyle(p.BOLD);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(sl.label, lx, ly);

      p.textSize(12);
      p.textStyle(p.NORMAL);
      const isUsedOver = i === activeSlice &&
        (1 - p.constrain(countdownSeconds / (agenda[i].minutes * 60), 0, 1)) > 0.5;
      p.fill(i === overrunSlice ? p.color(200, 50, 50) : isUsedOver ? 220 : 90);
      p.text(sl.minutes + ' min', lx, ly + 20);
    });

    // center dot
    p.fill(255);
    p.stroke(60);
    p.strokeWeight(2);
    p.ellipse(cx, cy, 22, 22);
    p.fill(30);
    p.noStroke();
    p.ellipse(cx, cy, 8, 8);

    // outer ring
    p.noFill();
    p.stroke(180);
    p.strokeWeight(1.5);
    p.ellipse(cx, cy, R * 2 + 6, R * 2 + 6);

    // real time — hour() minute() second()
    p.noStroke();
    p.fill(130);
    p.textSize(12);
    p.textStyle(p.NORMAL);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(
      p.nf(p.hour(), 2) + ':' + p.nf(p.minute(), 2) + ':' + p.nf(p.second(), 2),
      cx, cy + R + 14
    );

    // countdown box
    const boxY = cy + R + 28;
    const boxW = 320;
    const boxH = 88;

    p.fill(255);
    p.stroke(200);
    p.strokeWeight(1);
    p.rect(cx - boxW / 2, boxY, boxW, boxH, 10);

    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);

    if (activeSlice < 0) {
      p.fill(160);
      p.textSize(14);
      p.textStyle(p.NORMAL);
      p.text('click any section to start', cx, boxY + 44);
    } else {
      const mins = Math.floor(countdownSeconds / 60);
      const secs = Math.floor(countdownSeconds % 60);

      p.fill(80);
      p.textSize(13);
      p.textStyle(p.NORMAL);
      p.text(
        slices[activeSlice].label + '  ·  ' + agenda[activeSlice].minutes + ' min total',
        cx, boxY + 22
      );

      if (overrunSlice === activeSlice) {
        p.fill(200, 50, 50);
        p.textSize(32);
        p.textStyle(p.BOLD);
        p.text('TIME UP', cx, boxY + 58);
      } else {
        p.fill(30);
        p.textSize(36);
        p.textStyle(p.BOLD);
        p.text(p.nf(mins, 2) + ' : ' + p.nf(secs, 2), cx, boxY + 58);
      }
    }

    // hover / pause hint
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    if (hoveredSlice >= 0 && hoveredSlice !== activeSlice) {
      p.fill(80);
      p.textSize(11);
      p.textStyle(p.NORMAL);
      p.text(
        'click to start ' + slices[hoveredSlice].label +
        ' (' + agenda[hoveredSlice].minutes + ' min)',
        cx, boxY - 10
      );
    } else if (activeSlice >= 0 && !countdownRunning && overrunSlice !== activeSlice) {
      p.fill(100);
      p.textSize(11);
      p.textStyle(p.NORMAL);
      p.text('paused — click same section to restart', cx, boxY - 10);
    }

    // title
    p.noStroke();
    p.fill(30);
    p.textSize(22);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Meeting Agenda Clock', cx, 44);

    p.fill(120);
    p.textSize(12);
    p.textStyle(p.NORMAL);
    p.text('conference room  ·  team leads  ·  workplace', cx, 68);

    p.fill(160);
    p.textSize(11);
    p.text('click any section to start  ·  click same section to pause', cx, CANVAS_SIZE - 16);

    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.mousePressed = function () {
    const clicked = getSliceAt(p.mouseX, p.mouseY);
    if (clicked === -1) return;

    if (clicked === activeSlice && countdownRunning) {
      countdownRunning = false;
    } else if (clicked === activeSlice && !countdownRunning) {
      startCountdown(clicked);
    } else {
      startCountdown(clicked);
    }
  };

  p.windowResized = function () {
    p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  };
});