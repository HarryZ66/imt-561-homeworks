// Instance-mode sketch for tab 15 — HWK 5: Radial stacked area chart
registerSketch('sk15', function (p) {
  const CANVAS_W = 800;
  const CANVAS_H = 800;

  const cx = 400;
  const cy = 500;

  // Stacked area: inner = 2PA, then 3PA on top. Outer gold line = PTS.
  // Total shot attempts max scale: we anchor the OUTER boundary of the stacked
  // area at a constant radius (everyone shoots ~88 attempts/game). Then within
  // each radial slice, we split: inner band = 2PA, outer band = 3PA.
  const rInner = 70;          // inner boundary of stacked area (empty core)
  const rOuter = 260;         // outer boundary of stacked area (anchor)
  const rGold  = 305;         // gold PTS polyline base
  const rGoldMax = 360;

  const angStart = -Math.PI;
  const angEnd   = 0;
  const pivotYear = 2016;

  const ptsMin = 92, ptsMax = 116;
  // Total attempts per game in this dataset ranges ~85–93. We anchor the outer
  // ring at the dataset max so 3PA growth is shown as "eating into" 2PA share.
  const totalMin = 84, totalMax = 92;

  let sk15_data;
  let sk15_hoverIdx = -1;

  function yearAngle(yr) {
    const t = (yr - 2000) / (2024 - 2000);
    return angStart + (angEnd - angStart) * t;
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
    drawStackedArea();   // ← the new hero chart
    drawPtsLine();
    drawYearLabels();
    drawEndpointMarkers();
    drawPivotAnnotation();
    drawHoverTooltip();
    drawColorLegend();
    drawSummaryCards();
  };

  function drawHeader() {
    p.noStroke();
    p.fill(240, 240, 245);
    p.textSize(26);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('NBA Shooting Has Changed', cx, 38);

    p.fill(240, 175, 60);
    p.textSize(17);
    p.text('3-Pointers Eating Into 2-Pointers Since 2000', cx, 66);

    p.fill(150, 160, 180);
    p.textSize(12);
    p.textStyle(p.NORMAL);
    p.text('Each radial slice = one season  ·  Red expanding outward = 3PA taking share from 2PA',
           cx, 90);
  }

  // ─── The hero: radial stacked area ───
  // For each season, we draw two "wedges" between two consecutive angles.
  // Inner wedge (rInner → rSplit) = 2PA share
  // Outer wedge (rSplit → rOuter) = 3PA share
  function drawStackedArea() {
    const n = sk15_data.length;

    // 1) build polygons by going forward along outer ring, then backward along
    //    the split ring (for 3PA layer), and forward along split, backward
    //    along inner (for 2PA layer)
    const angles = sk15_data.map(d => yearAngle(d.year));
    const splits = sk15_data.map(d => {
      const total = d.pa2 + d.pa3;
      // share of 2PA out of total attempts decides the split radius
      const share2 = d.pa2 / total;
      // 2PA occupies the INNER band from rInner outward.
      // So splitRadius = rInner + share2 * (rOuter - rInner)
      return rInner + share2 * (rOuter - rInner);
    });

    // ── 2PA inner layer (blue) ──
    p.noStroke();
    p.fill(60, 120, 200, 220);
    p.beginShape();
    // outer edge of 2PA layer (= split radii), forward
    for (let i = 0; i < n; i++) {
      p.vertex(cx + Math.cos(angles[i]) * splits[i],
               cy + Math.sin(angles[i]) * splits[i]);
    }
    // back along inner ring (constant rInner)
    for (let i = n - 1; i >= 0; i--) {
      p.vertex(cx + Math.cos(angles[i]) * rInner,
               cy + Math.sin(angles[i]) * rInner);
    }
    p.endShape(p.CLOSE);

    // ── 3PA outer layer (red) ──
    p.fill(210, 55, 55, 235);
    p.beginShape();
    // outer constant ring, forward
    for (let i = 0; i < n; i++) {
      p.vertex(cx + Math.cos(angles[i]) * rOuter,
               cy + Math.sin(angles[i]) * rOuter);
    }
    // back along the split (= 3PA inner boundary)
    for (let i = n - 1; i >= 0; i--) {
      p.vertex(cx + Math.cos(angles[i]) * splits[i],
               cy + Math.sin(angles[i]) * splits[i]);
    }
    p.endShape(p.CLOSE);

    // ── split line (where 2PA ends and 3PA begins) — thin yellow stroke ──
    p.noFill();
    p.stroke(255, 220, 150, 180);
    p.strokeWeight(1.5);
    p.beginShape();
    for (let i = 0; i < n; i++) {
      p.vertex(cx + Math.cos(angles[i]) * splits[i],
               cy + Math.sin(angles[i]) * splits[i]);
    }
    p.endShape();

    // ── hover highlight: thin vertical line at the hovered year ──
    if (sk15_hoverIdx >= 0) {
      const ang = angles[sk15_hoverIdx];
      p.stroke(255, 255, 255, 200);
      p.strokeWeight(2);
      p.line(cx + Math.cos(ang) * rInner, cy + Math.sin(ang) * rInner,
             cx + Math.cos(ang) * rOuter, cy + Math.sin(ang) * rOuter);
    }
  }

  // ─── Gold PTS line on outside of the stacked area ───
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
  }

  function drawYearLabels() {
    p.noStroke();
    p.fill(200, 210, 225);
    p.textStyle(p.BOLD);
    p.textSize(13);
    p.textAlign(p.CENTER, p.CENTER);
    const ticks = [2008, 2012, 2016, 2020];
    for (const yr of ticks) {
      const ang = yearAngle(yr);
      const r = 282;  // between stacked area outer edge and gold line
      const lx = cx + Math.cos(ang) * r;
      const ly = cy + Math.sin(ang) * r;

      // dark plate behind label so it doesn't get crossed by the gold line
      p.noStroke();
      p.fill(16, 24, 44);
      p.rect(lx - 22, ly - 10, 44, 20, 4);

      p.fill(200, 210, 225);
      p.text(yr, lx, ly);
    }
  }

  function drawEndpointMarkers() {
    drawEndpoint('left',  sk15_data[0],                    '2000', 'START');
    drawEndpoint('right', sk15_data[sk15_data.length - 1], '2024', 'TODAY');
  }

  function drawEndpoint(side, d, yearTxt, tagTxt) {
    const ang = side === 'left' ? angStart : angEnd;
    const ax = cx + Math.cos(ang) * rOuter;
    const ay = cy + Math.sin(ang) * rOuter;

    p.noStroke();
    p.fill(240, 175, 60);
    p.ellipse(ax, ay, 12, 12);
    p.fill(16, 24, 44);
    p.ellipse(ax, ay, 5, 5);

    const align = side === 'left' ? p.RIGHT : p.LEFT;
    const dirSign = side === 'left' ? -1 : 1;
    const labelX = ax + dirSign * 16;

    p.fill(240, 240, 245);
    p.textStyle(p.BOLD);
    p.textSize(22);
    p.textAlign(align, p.CENTER);
    p.text(yearTxt, labelX, ay - 18);

    p.fill(240, 175, 60);
    p.textSize(10);
    p.text(tagTxt, labelX, ay - 2);

    // three colored value rows
    const valueRows = [
      { color: [220, 60, 60],  label: 'Threes', value: d.pa3.toFixed(1) },
      { color: [85, 150, 230], label: 'Twos',   value: d.pa2.toFixed(1) },
      { color: [240, 175, 60], label: 'Points', value: d.pts.toFixed(1) },
    ];

    let ry = ay + 20;
    for (const row of valueRows) {
      // dot
      p.noStroke();
      p.fill(row.color[0], row.color[1], row.color[2]);
      const dotX = side === 'left' ? labelX - 86 : labelX;
      p.ellipse(dotX, ry, 7, 7);

      // label
      p.fill(150, 160, 180);
      p.textStyle(p.NORMAL);
      p.textSize(10);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(row.label, dotX + 8, ry);

      // value
      p.fill(row.color[0], row.color[1], row.color[2]);
      p.textStyle(p.BOLD);
      p.textSize(13);
      p.textAlign(p.RIGHT, p.CENTER);
      const valX = side === 'left' ? labelX : labelX + 86;
      p.text(row.value, valX, ry);

      ry += 17;
    }
  }

  function drawPivotAnnotation() {
    const d = sk15_data.find(x => x.year === pivotYear);
    const ang = yearAngle(pivotYear);
    const total = d.pa2 + d.pa3;
    const share2 = d.pa2 / total;
    const splitR = rInner + share2 * (rOuter - rInner);
    const px = cx + Math.cos(ang) * splitR;
    const py = cy + Math.sin(ang) * splitR;

    // bright marker on the split line at 2016
    p.fill(255, 220, 150);
    p.noStroke();
    p.ellipse(px, py, 10, 10);
    p.fill(16, 24, 44);
    p.ellipse(px, py, 4, 4);

    // annotation in the empty top-center area
    const boxX = cx - 130;
    const boxY = 130;
    const boxW = 260;
    const boxH = 70;

    p.fill(22, 32, 56, 240);
    p.noStroke();
    p.rect(boxX, boxY, boxW, boxH, 6);
    p.fill(240, 175, 60);
    p.rect(boxX, boxY, 3, boxH);

    // tiny dashed connector down to pivot
    p.stroke(255, 220, 150, 130);
    p.strokeWeight(1);
    p.drawingContext.setLineDash([3, 4]);
    p.noFill();
    p.line(boxX + boxW / 2, boxY + boxH, px, py - 8);
    p.drawingContext.setLineDash([]);

    p.noStroke();
    p.fill(240, 240, 245);
    p.textSize(15);
    p.textStyle(p.BOLD);
    p.textAlign(p.LEFT, p.TOP);
    p.text('2016 — The Tipping Point', boxX + 12, boxY + 8);

    p.fill(220, 60, 60);
    p.textSize(11);
    p.text('3PA share crossed 1/4 of total attempts', boxX + 12, boxY + 30);

    p.fill(150, 160, 180);
    p.textStyle(p.NORMAL);
    p.text('Warriors went 73-9 that season', boxX + 12, boxY + 48);
  }

  function drawHoverTooltip() {
    sk15_hoverIdx = -1;
    const dx = p.mouseX - cx;
    const dy = p.mouseY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dy < 8 && dist > rInner - 10 && dist < rOuter + 30) {
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
    const total = d.pa2 + d.pa3;
    const pct3 = (d.pa3 / total * 100).toFixed(1);

    const boxW = 180, boxH = 115;
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
    let row = by + 36;

    p.textSize(10); p.textStyle(p.NORMAL); p.fill(150, 160, 180);
    p.textAlign(p.LEFT, p.CENTER); p.text('3-point attempts', labelX, row);
    p.fill(220, 60, 60); p.textStyle(p.BOLD); p.textSize(12);
    p.textAlign(p.RIGHT, p.CENTER); p.text(d.pa3.toFixed(1), valX, row);
    row += 18;

    p.textSize(10); p.textStyle(p.NORMAL); p.fill(150, 160, 180);
    p.textAlign(p.LEFT, p.CENTER); p.text('2-point attempts', labelX, row);
    p.fill(85, 150, 230); p.textStyle(p.BOLD); p.textSize(12);
    p.textAlign(p.RIGHT, p.CENTER); p.text(d.pa2.toFixed(1), valX, row);
    row += 18;

    p.textSize(10); p.textStyle(p.NORMAL); p.fill(150, 160, 180);
    p.textAlign(p.LEFT, p.CENTER); p.text('Points scored', labelX, row);
    p.fill(240, 175, 60); p.textStyle(p.BOLD); p.textSize(12);
    p.textAlign(p.RIGHT, p.CENTER); p.text(d.pts.toFixed(1), valX, row);
    row += 22;

    p.fill(105, 118, 145);
    p.textSize(10);
    p.textStyle(p.NORMAL);
    p.textAlign(p.LEFT, p.CENTER);
    p.text('3PA = ' + pct3 + '% of all shots', labelX, row);
  }

  function drawColorLegend() {
    const y = 620;
    p.textStyle(p.NORMAL);
    p.textSize(12);
    p.textAlign(p.LEFT, p.CENTER);

    const items = [
      { color: [220, 60, 60],  label: 'Red area = 3-point attempts' },
      { color: [85, 150, 230], label: 'Blue area = 2-point attempts' },
      { color: [240, 175, 60], label: 'Gold line = Points scored' },
    ];
    const gap = 22;
    const dotR = 9;
    const widths = items.map(it => p.textWidth(it.label));
    const totalW = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1) + items.length * (dotR + 6);
    let x = cx - totalW / 2;

    items.forEach((it, i) => {
      p.noStroke();
      p.fill(it.color[0], it.color[1], it.color[2]);
      p.rect(x, y - 5, dotR, 10, 2);
      p.fill(180, 190, 210);
      p.text(it.label, x + dotR + 6, y);
      x += dotR + 6 + widths[i] + gap;
    });

    p.fill(105, 118, 145);
    p.textSize(10);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Hover any year on the dial for full stats', cx, y + 22);
  }

  function drawSummaryCards() {
    const yTop = 670;
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
      { top: '76.3 → 53.2',  sub: 'Twos per game  (−30.3%)',    color: [85, 150, 230] },
      { top: '94.3 → 114.2', sub: 'Points per game  (+21.1%)',  color: [240, 175, 60] },
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

  p.windowResized = function () { p.resizeCanvas(CANVAS_W, CANVAS_H); };
});