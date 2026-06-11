/* Subtle ambient node canvas — hero only */

(function () {
  'use strict';

  function initHeroCanvas() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(min-width: 900px)').matches) return;

    var canvas = document.getElementById('hero-canvas');
    var section = document.querySelector('.hero-section');
    if (!canvas || !section) return;

    var ctx = canvas.getContext('2d');
    var nodes = [];
    var mouse = { x: -9999, y: -9999 };
    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2d6a4f';
    var COUNT = 36;
    var LINK = 130;
    var dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = section.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodes.length) spawn(rect.width, rect.height);
    }

    function spawn(w, h) {
      nodes = [];
      for (var i = 0; i < COUNT; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: 1 + Math.random() * 1.2
        });
      }
    }

    function step(w, h) {
      nodes.forEach(function (n) {
        var dx = mouse.x - n.x;
        var dy = mouse.y - n.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160 && dist > 0) {
          n.vx -= (dx / dist) * 0.008;
          n.vy -= (dy / dist) * 0.008;
        }
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.995;
        n.vy *= 0.995;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));
      });
    }

    function draw(w, h) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i];
          var b = nodes[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.strokeStyle = accent;
            ctx.globalAlpha = (1 - d / LINK) * 0.14;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(function (n) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function loop() {
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;
      step(w, h);
      draw(w, h);
      requestAnimationFrame(loop);
    }

    section.addEventListener('mousemove', function (e) {
      var rect = section.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });

    section.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    window.addEventListener('resize', resize);
    resize();
    loop();

    document.addEventListener('theme-change', function () {
      accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroCanvas);
  } else {
    initHeroCanvas();
  }
})();
