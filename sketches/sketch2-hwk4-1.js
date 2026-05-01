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

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    let angle = p.TWO_PI * 0.75;
    agenda.forEach(a => {
      const sweep = (a.minutes / totalMinutes) * p.TWO_PI;
      slices.push({ ...a, start: angle, end: angle + sweep });
      angle += sweep;
    });
  };

  p.draw = function () {
    p.background(248);
    slices.forEach(sl => {
      p.fill(sl.col[0], sl.col[1], sl.col[2], 140);
      p.stroke(255);
      p.strokeWeight(2);
      p.arc(cx, cy, R * 2, R * 2, sl.start, sl.end, p.PIE);
    });
    p.noFill(); p.stroke(0); p.strokeWeight(1);
    p.rect(0, 0, p.width - 1, p.height - 1);
  };

  p.windowResized = function () { p.resizeCanvas(CANVAS_SIZE, CANVAS_SIZE); };
});