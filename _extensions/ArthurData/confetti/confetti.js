var script = document.createElement("script");
script.setAttribute("type", "text/javascript");
script.setAttribute("src", "https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js");
document.getElementsByTagName("head")[0].appendChild(script);

var posX = window.innerWidth / 2;
var posY = window.innerHeight / 2;

function getPosition(event) {
  posX = event.pageX;
  posY = event.pageY;
}

document.addEventListener("mousemove", getPosition, false);

function fireConfettiFromOrigin(options, originX, originY) {
  if (typeof confetti !== "function") return;
  confetti({
    particleCount: options.particleCount,
    angle: options.angle,
    spread: options.spread,
    startVelocity: options.startVelocity,
    decay: options.decay,
    gravity: options.gravity,
    drift: options.drift,
    ticks: options.ticks,
    colors: options.colors,
    shapes: options.shapes,
    scalar: options.scalar,
    zIndex: options.zIndex,
    disableForReducedMotion: options.disableForReducedMotion,
    origin: { x: originX, y: originY }
  });
}

function fireForSlide(slide, deckConfig) {
  if (!slide || slide.dataset.confetti !== "true") return;
  if (typeof confetti !== "function") {
    // canvas-confetti not loaded yet, retry once after a short delay
    setTimeout(function () { fireForSlide(slide, deckConfig); }, 250);
    return;
  }

  var baseOptions = deckConfig.confetti || {};
  var isLarge   = slide.dataset.confettiLarge === "true";
  var duration  = parseInt(slide.dataset.confettiDuration, 10) || 0;

  // Burst from the slide's centre, scaled larger if requested
  var perBurst = Object.assign({}, baseOptions, {
    particleCount: isLarge ? (baseOptions.particleCount || 150) * 2 : (baseOptions.particleCount || 150)
  });

  // Immediate burst
  fireConfettiFromOrigin(perBurst, 0.5, 0.5);

  // If duration > 0, keep firing every 800 ms from random positions for that many seconds
  if (duration > 0) {
    var elapsed = 0;
    var interval = setInterval(function () {
      elapsed += 0.8;
      if (elapsed >= duration) { clearInterval(interval); return; }
      var x = 0.15 + Math.random() * 0.7;
      var y = 0.2  + Math.random() * 0.4;
      fireConfettiFromOrigin(perBurst, x, y);
    }, 800);
  }
}

window.RevealConfetti = function () {
  return {
    id: "RevealConfetti",
    init: function (deck) {

      // ── Manual trigger: press C to fire from mouse position ────
      deck.addKeyBinding({ keyCode: 67, key: "C" }, function () {
        var config = deck.getConfig();
        var options = config.confetti || {};
        fireConfettiFromOrigin(
          options,
          posX / window.innerWidth,
          posY / window.innerHeight
        );
      });

      // ── Automatic trigger on slide entry when slide has   ──
      //     data-confetti="true"
      var deckConfig = deck.getConfig();

      deck.on("slidechanged", function (event) {
        fireForSlide(event.currentSlide, deckConfig);
      });

      // Fire on initial slide too (slidechanged doesn't fire on first show)
      deck.on("ready", function (event) {
        fireForSlide(event.currentSlide, deckConfig);
      });
    },
  };
};
