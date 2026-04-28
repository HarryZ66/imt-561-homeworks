// Example 10 placeholder
registerSketch('sk16', function (p) {
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = function () {
    p.background(245);
    p.fill(80);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(28);
    p.text('Ex 10 placeholder', p.width / 2, p.height / 2);
  };

  p.windowResized = function () { p.resizeCanvas(p.windowWidth, p.windowHeight); };
});
