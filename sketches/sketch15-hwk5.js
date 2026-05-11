// Instance-mode sketch for tab 15 — HWK 5: NBA narrative visualization
registerSketch('sk15', function (p) {
  const CANVAS_W = 800;
  const CANVAS_H = 800;

  const cx = 400;
  const cy = 475;

  const rBarOuter = 220;
  const rBarInnerMin = 130;
  const rBarInnerMax = 200;
  const rYearLabels = 270;   // moved further out so labels don't sit on the gold line
  const rGold = 305;
  const rGoldMax = 360;

  const angStart = -Math.PI;
  const angEnd   = 0;
  const pivotYear = 2016;

  const pa3Min = 13, pa3Max = 36;
  const ptsMin = 92, ptsMax = 116;

  let sk15_data;
  let sk15_hoverIdx = -1;

  function yearAngle(yr) {
    const t = (yr - 2000) / (2024 - 2000);
    return angStart + (angEnd - angStart) * t;
  }
  function pa3InnerRadius(v) {
    return p.map(v, pa3Min, pa3Max, rBarInnerMax, rBarInnerMin);
  }
  function ptsRadius(v) {
    return p.map(v, ptsMin, ptsMax, rGold, rGoldMax);
  }

  p.setup = function () {
    p.createCanvas(CANVAS_W, CANVAS_H);
    p.textFont('Inter, -apple-system, sans-serif');

    sk15_data = [
      { year: 2000, pts: 94.3,  pa2: 76.3, pa3: 13.7 },
      { year: 2001, pts: 95.9,  pa2: 77.6, pa3: 14.3 },
      { year: 2002, pts: 95.9,  pa2: 77.6, pa3: 13.6 },
      { year: 2003, pts: 95.7,  pa2: 77.8, pa3: 13.5 },
      { year: 2004, pts: 93.4,  pa2: 75.4, pa3: 14.9 },
      { year: 2005, pts: 97.2,  pa2: 75.4, pa3: 15.8 },
      { year: 2006, pts: 97.0,  pa2: 75.0, pa3: 16.0 },
      { year: 2007, pts: 98.7,  pa2: 75.7, pa3: 16.9 },
      { year: 2008, pts: 99.9,  pa2: 74.8, pa3: 18.1 },
      { year: 2009, pts: 100.0, pa2: 73.6, pa3: 18.1 },
      { year: 2010, pts: 100.4, pa2: 73.5, pa3: 18.1 },
      { year: 2011, pts: 99.6,  pa2: 73.4, pa3: 18.0 },
      { year: 2012, pts: 96.3,  pa2: 71.5, pa3: 18.4 },
      { year: 2013, pts: 98.1,  pa2: 72.0, pa3: 20.0 },
      { year: 2014, pts: 101.0, pa2: 71.0, pa3: 21.5 },
      { year: 2015, pts: 100.0, pa2: 69.1, pa3: 22.4 },
      { year: 2016, pts: 102.7, pa2: 68.6, pa3: 24.1 },
      { year: 2017, pts: 105.6, pa2: 67.6, pa3: 27.0 },
      { year: 2018, pts: 106.3, pa2: 65.6, pa3: 29.0 },
      { year: 2019, pts: 111.2, pa2: 67.1, pa3: 32.0 },
      { year: 2020, pts: 111.8, pa2: 64.6, pa3: 34.1 },
      { year: 2021, pts: 112.1, pa2: 53.4, pa3: 34.6 },
      { year: 2022, pts: 110.6, pa2: 52.9, pa3: 35.2 },
      { year: 2023, pts: 114.7, pa2: 54.7, pa3: 34.2 },
      { year: 2024, pts: 114.2, pa2: 53.2, pa3: 35.1 }
    ];
  };

  p.draw = function () {
    p.background(16, 24, 44);
    drawHeader();
    drawDial();
    drawTimelineBaseline();
    drawStartEndMarkers();
    drawElementLegend();
    drawPivotPointer();
    drawHoverTooltip();
    drawSummaryCards();
    drawCaption();
    drawBottomHint();
  };

  function drawHeader() {
    p.noStroke();
    p.fill(240, 240, 245);
    p.textSize(22);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('NBA Shooting Has Changed', cx, 32);

    p.fill(240, 175, 60);
    p.textSize(18);
    p.text('3-Pointers Are Up 156% Since 2000', cx, 60);

    p.fill(150, 160, 180);
    p.textSize(12);
    p.textStyle(p.NORMAL);
    p.text('A 25-year look at how the league traded mid-range shots for threes — and scored more doing it.',
           cx, 84);
  }

  function drawDial() {
    p.noFill();
    p.stroke(255, 255, 255, 10);
    p.strokeWeight(1);
    for (let r = rBarInnerMin; r <= rBarOuter; r += 25) {
      p.arc(cx, cy, r * 2, r * 2, angStart, angEnd);
    }

    drawPtsLine();
    drawPaBars();
    drawYearLabels();
  }

  function drawPaBars() {
    for (let i = 0; i < sk15_data.length; i++) {
      const d = sk15_data[i];
      const ang = yearAngle(d.year);
      const rOuter = rBarOuter;
      const rInner = pa3InnerRadius(d.pa3);
      const isHover = i === sk15_hoverIdx;
      const isPivot = d.year === pivotYear;

      const t = (d.pa3 - pa3Min) / (pa3Max - pa3Min);
      const baseR = p.lerp(170, 235, t);
      const baseG = p.lerp(50, 70, t);
      const baseB = p.lerp(50, 75, t);
      p.stroke(baseR, baseG, baseB, isHover ? 255 : 220);
      p.strokeWeight(isHover ? 9 : 6.5);
      p.strokeCap(p.ROUND);

      const x1 = cx + Math.cos(ang) * rOuter;
      const y1 = cy + Math.sin(ang) * rOuter;
      const x2 = cx + Math.cos(ang) * rInner;
      const y2 = cy + Math.sin(ang) * rInner;
      p.line(x1, y1, x2, y2);

      if (isPivot) {
        p.stroke(255, 200, 100);
        p.strokeWeight(2);
        p.drawingContext.setLineDash([4, 4]);
        const xExt = cx + Math.cos(ang) * (rInner - 40);
        const yExt = cy + Math.sin(ang) * (rInner - 40);
        p.line(x2, y2, xExt, yExt);
        p.drawingContext.setLineDash([]);
      }
    }
  }

  function drawPtsLine() {
    p.noFill();
    p.stroke(240, 175, 60);
    p.strokeWeight(2.5);
    p.strokeCap(p.ROUND);
    p.strokeJoin(p.ROUND);
    p.beginShape();
    for (const d of sk15_data) {
      const ang = yearAngle(d.year);
      const r = ptsRadius(d.pts);
      p.vertex(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    }
    p.endShape();

    const highlight = new Set([2012, 2016]);
    for (const d of sk15_data) {
      if (!highlight.has(d.year)) continue;
      const ang = yearAngle(d.year);
      const r = ptsRadius(d.pts);
      const px = cx + Math.cos(ang) * r;
      const py = cy + Math.sin(ang) * r;
      p.noStroke();
      p.fill(240, 175, 60);
      p.ellipse(px, py, 8, 8);

      p.fill(240, 240, 245);
      p.textSize(11);
      p.textStyle(p.BOLD);
      p.textAlign(p.CENTER, p.BOTTOM);
      if (d.year === 2012)      p.text('96.3 pts', px, py - 10);
      else if (d.year === 2016) {
        p.fill(240, 175, 60);
        p.text('102.7 pts', px, py - 10);
      }
    }
  }

  function drawYearLabels() {
    // small dark plate behind each label so it never appears to be crossed by the gold line
    const ticks = [2008, 2012, 2016, 2020];
    for (const yr of ticks) {
      const ang = yearAngle(yr);
      const r = rYearLabels;
      const lx = cx + Math.cos(ang) * r;
      const ly = cy + Math.sin(ang) * r;

      p.noStroke();
      p.fill(16, 24, 44);
      p.rect(lx - 22, ly - 11, 44, 22, 4);

      p.fill(200, 210, 225);
      p.textStyle(p.BOLD);
      p.textSize(13);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(yr, lx, ly);
    }
  }

  function drawStartEndMarkers() {
    drawAnchor(2000, 'START', sk15_data[0].pa3, 'left');
    drawAnchor(2024, 'TODAY', sk15_data[sk15_data.length - 1].pa3, 'right');
  }

  function drawAnchor(year, label, pa3Val, side) {
    const ang = yearAngle(year);
    const ax = cx + Math.cos(ang) * rBarOuter;
    const ay = cy + Math.sin(ang) * rBarOuter;

    p.noStroke();
    p.fill(240, 175, 60);
    p.ellipse(ax, ay, 14, 14);
    p.fill(16, 24, 44);
    p.ellipse(ax, ay, 6, 6);

    const offsetX = side === 'left' ? -14 : 14;
    p.fill(240, 240, 245);
    p.textStyle(p.BOLD);
    p.textSize(22);
    p.textAlign(side === 'left' ? p.RIGHT : p.LEFT, p.CENTER);
    p.text(year, ax + offsetX, ay - 14);

    p.fill(240, 175, 60);
    p.textSize(10);
    p.text(label, ax + offsetX, ay + 4);

    p.fill(220, 60, 60);
    p.textStyle(p.BOLD);
    p.textSize(13);
    p.text(pa3Val.toFixed(1) + ' threes/game', ax + offsetX, ay + 20);
  }

  function drawTimelineBaseline() {
    const yLine = cy + 8;
    const xLeft = cx + Math.cos(yearAngle(2000)) * rBarOuter;
    const xRight = cx + Math.cos(yearAngle(2024)) * rBarOuter;

    p.stroke(80, 95, 120);
    p.strokeWeight(1.5);
    p.line(xLeft, yLine, xRight, yLine);

    p.noStroke();
    p.fill(80, 95, 120);
    p.triangle(xRight, yLine, xRight - 8, yLine - 4, xRight - 8, yLine + 4);

    p.fill(120, 135, 160);
    p.textStyle(p.BOLD);
    p.textSize(10);
    p.textAlign(p.CENTER, p.TOP);
    p.text('TIME  →  2000 to 2024  ·  25 NBA seasons', cx, yLine + 6);
  }

  function drawElementLegend() {
    // ── GOLD LINE callout (top-left) ──
    const gx = 30, gy = 175;
    p.noStroke();
    p.fill(240, 175, 60);
    p.ellipse(gx, gy, 9, 9);

    p.fill(240, 240, 245);
    p.textStyle(p.BOLD);
    p.textSize(12);
    p.textAlign(p.LEFT, p.CENTER);
    p.text('OUTER GOLD LINE', gx + 14, gy);

    p.fill(150, 160, 180);
    p.textStyle(p.NORMAL);
    p.textSize(11);
    p.text('Points scored per game', gx + 14, gy + 16);
    p.text('Higher = more scoring', gx + 14, gy + 30);

    // arrow to gold line + small target circle
    const goldAng = yearAngle(2006);
    const goldX = cx + Math.cos(goldAng) * ptsRadius(97.0);
    const goldY = cy + Math.sin(goldAng) * ptsRadius(97.0);
    p.stroke(240, 175, 60, 130);
    p.strokeWeight(1);
    p.drawingContext.setLineDash([2, 3]);
    p.line(gx + 100, gy + 22, goldX - 6, goldY + 4);
    p.drawingContext.setLineDash([]);
    p.noFill();
    p.stroke(240, 175, 60);
    p.strokeWeight(1.5);
    p.ellipse(goldX, goldY, 12, 12);

    // ── RED BARS callout (top-right) ──
    const rx = 595, ry = 235;
    p.noStroke();
    p.fill(220, 60, 60);
    p.rect(rx - 2, ry - 6, 4, 12);

    p.fill(240, 240, 245);
    p.textStyle(p.BOLD);
    p.textSize(12);
    p.textAlign(p.LEFT, p.CENTER);
    p.text('INNER RED BARS', rx + 12, ry);

    p.fill(150, 160, 180);
    p.textStyle(p.NORMAL);
    p.textSize(11);
    p.text('3-pointers attempted per game', rx + 12, ry + 16);
    p.text('Longer (inward) = more threes', rx + 12, ry + 30);

    // arrow to a specific red bar + small target circle
    const redAng = yearAngle(2020);
    const redX = cx + Math.cos(redAng) * rBarOuter;
    const redY = cy + Math.sin(redAng) * rBarOuter;
    p.stroke(220, 60, 60, 130);
    p.strokeWeight(1);
    p.drawingContext.setLineDash([2, 3]);
    p.line(rx + 10, ry + 22, redX + 8, redY - 4);
    p.drawingContext.setLineDash([]);
    p.noFill();
    p.stroke(220, 60, 60);
    p.strokeWeight(1.5);
    p.ellipse(redX, redY - 10, 14, 14);
  }

  function drawPivotPointer() {
    const d = sk15_data.find(x => x.year === pivotYear);
    const ang = yearAngle(pivotYear);
    const r = pa3InnerRadius(d.pa3);
    const px = cx + Math.cos(ang) * r;
    const py = cy + Math.sin(ang) * r;

    p.fill(240, 175, 60);
    p.noStroke();
    p.ellipse(px, py, 11, 11);

    // ── annotation moved to top-center (above the dial, between the two callouts) ──
    const boxX = 280;
    const boxY = 115;
    const boxW = 240;

    p.fill(22, 32, 56, 240);
    p.noStroke();
    p.rect(boxX - 8, boxY - 8, boxW, 80, 6);

    p.fill(240, 175, 60);
    p.rect(boxX - 8, boxY - 8, 3, 80);

    // connector — short dashed line from box-bottom down to the pivot dot
    p.stroke(255, 200, 100, 130);
    p.strokeWeight(1);
    p.drawingContext.setLineDash([3, 4]);
    p.noFill();
    p.line(boxX + boxW / 2 - 8, boxY + 72, px, py - 5);
    p.drawingContext.setLineDash([]);

    p.noStroke();
    p.fill(240, 240, 245);
    p.textSize(20);
    p.textStyle(p.BOLD);
    p.textAlign(p.LEFT, p.TOP);
    p.text('2016 — THE TIPPING POINT', boxX, boxY);

    p.fill(220, 60, 60);
    p.textSize(11);
    p.text('24.1 threes/game  ·  102.7 pts', boxX, boxY + 28);

    p.fill(150, 160, 180);
    p.textStyle(p.NORMAL);
    p.text('Warriors went 73-9 this season', boxX, boxY + 46);
  }

  function drawHoverTooltip() {
    sk15_hoverIdx = -1;
    const dx = p.mouseX - cx;
    const dy = p.mouseY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dy < 8 && dist > rBarInnerMin - 20 && dist < rBarOuter + 20) {
      const a = Math.atan2(dy, dx);
      let best = -1, bestDiff = 1e9;
      for (let i = 0; i < sk15_data.length; i++) {
        const diff = Math.abs(a - yearAngle(sk15_data[i].year));
        if (diff < bestDiff) { bestDiff = diff; best = i; }
      }
      const segWidth = Math.PI / sk15_data.length;
      if (bestDiff < segWidth) sk15_hoverIdx = best;
    }

    if (sk15_hoverIdx < 0) return;

    const d = sk15_data[sk15_hoverIdx];
    const boxW = 170, boxH = 100;
    let bx = p.mouseX + 12;
    let by = p.mouseY + 12;
    if (bx + boxW > CANVAS_W - 15) bx = p.mouseX - boxW - 12;
    if (by + boxH > CANVAS_H - 15) by = p.mouseY - boxH - 12;

    p.noStroke();
    p.fill(28, 36, 60, 245);
    p.rect(bx, by, boxW, boxH, 6);
    p.noFill();
    p.stroke(240, 175, 60);
    p.strokeWeight(1);
    p.rect(bx, by, boxW, boxH, 6);

    p.noStroke();
    p.fill(240, 240, 245);
    p.textStyle(p.BOLD);
    p.textSize(16);
    p.textAlign(p.LEFT, p.TOP);
    p.text(d.year + ' season', bx + 10, by + 8);

    const labelX = bx + 10, valX = bx + boxW - 10;
    let row = by + 38;

    p.textSize(10); p.textStyle(p.NORMAL); p.fill(150, 160, 180);
    p.textAlign(p.LEFT, p.CENTER); p.text('Threes attempted', labelX, row);
    p.fill(220, 60, 60); p.textStyle(p.BOLD); p.textSize(12);
    p.textAlign(p.RIGHT, p.CENTER); p.text(d.pa3.toFixed(1), valX, row);
    row += 19;

    p.textSize(10); p.textStyle(p.NORMAL); p.fill(150, 160, 180);
    p.textAlign(p.LEFT, p.CENTER); p.text('Points scored', labelX, row);
    p.fill(240, 175, 60); p.textStyle(p.BOLD); p.textSize(12);
    p.textAlign(p.RIGHT, p.CENTER); p.text(d.pts.toFixed(1), valX, row);
    row += 19;

    p.textSize(10); p.textStyle(p.NORMAL); p.fill(150, 160, 180);
    p.textAlign(p.LEFT, p.CENTER); p.text('Twos attempted', labelX, row);
    p.fill(85, 150, 230); p.textStyle(p.BOLD); p.textSize(12);
    p.textAlign(p.RIGHT, p.CENTER); p.text(d.pa2.toFixed(1), valX, row);
  }

  function drawSummaryCards() {
    const yTop = 585;
    p.noStroke();
    p.fill(240, 175, 60);
    p.textStyle(p.BOLD);
    p.textSize(13);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('THE 25-YEAR SHIFT', cx, yTop);

    p.stroke(255, 255, 255, 22);
    p.strokeWeight(1);
    p.line(cx - 130, yTop + 14, cx + 130, yTop + 14);

    const cards = [
      { top: '13.7 → 35.1',  sub: 'Threes per game  (+156%)',   color: [220, 60, 60] },
      { top: '94.3 → 114.2', sub: 'Points per game  (+21.1%)',  color: [240, 175, 60] },
      { top: '76.3 → 53.2',  sub: 'Twos per game  (−30.3%)',    color: [85, 150, 230] },
    ];

    const cardW = 220, cardH = 70, gap = 14;
    const totalW = cardW * 3 + gap * 2;
    const startX = cx - totalW / 2;
    const cardY = yTop + 30;

    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const x = startX + i * (cardW + gap);

      p.noStroke();
      p.fill(22, 32, 56);
      p.rect(x, cardY, cardW, cardH, 6);

      p.fill(c.color[0], c.color[1], c.color[2]);
      p.rect(x + 8, cardY + 6, cardW - 16, 3, 2);

      p.fill(240, 240, 245);
      p.textStyle(p.BOLD);
      p.textSize(17);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(c.top, x + cardW / 2, cardY + 33);

      p.fill(150, 160, 180);
      p.textStyle(p.NORMAL);
      p.textSize(11);
      p.text(c.sub, x + cardW / 2, cardY + 54);
    }
  }

  function drawCaption() {
    const y = 698;
    const w = 720;
    p.noStroke();
    p.fill(22, 32, 56);
    p.rect(cx - w / 2, y, w, 56, 4);

    p.fill(240, 175, 60);
    p.rect(cx - w / 2, y, 3, 56);

    p.fill(240, 240, 245);
    p.textStyle(p.BOLD);
    p.textSize(12);
    p.textAlign(p.LEFT, p.TOP);
    p.text('How to read this chart',
           cx - w / 2 + 14, y + 8);

    p.fill(150, 160, 180);
    p.textStyle(p.NORMAL);
    p.textSize(11);
    p.text('The half-circle is a TIMELINE from 2000 (left) to 2024 (right).',
           cx - w / 2 + 14, y + 26);
    p.text('Red bars grow inward as 3-point shooting rises  ·  Gold line rises outward as scoring increases.',
           cx - w / 2 + 14, y + 40);
  }

  function drawBottomHint() {
    const y = 770;
    p.noStroke();
    p.fill(105, 118, 145);
    p.textSize(10);
    p.textStyle(p.NORMAL);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Hover any year on the dial to see exact stats for that season',
           cx, y);
  }

  p.windowResized = function () { p.resizeCanvas(CANVAS_W, CANVAS_H); };
});