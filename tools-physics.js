/* ======================================
   Balloon-like Tool Ball Physics + Basket Scoring
====================================== */

let score = 0;
const scoreEl = document.getElementById("toolScore");

document.addEventListener('DOMContentLoaded', () => {
  const ring = document.querySelector('.basket-ring');
  const balls = [...document.querySelectorAll('.tool-ball')];
  const container = document.querySelector('.skill-tag-row');
  const basket = document.querySelector('.basket');

  if (!container || balls.length === 0 || !basket) return;

  const gravity = 0.12;
  const buoyancy = -0.08;
  const friction = 0.995;
  const bounce = 0.9;
  const driftStrength = 0.03;

  const ballData = balls.map(ball => ({
    el: ball,
    radius: ball.offsetWidth / 2,
    pos: {
      x: Math.random() * (container.clientWidth - 60),
      y: container.clientHeight - 80
    },
    vel: {
      x: (Math.random() - 0.5) * 1.2,
      y: (Math.random() - 0.5) * 1.2
    },
    drag: false,
    lastPointer: { x: 0, y: 0 },
    driftOffset: Math.random() * 1000,
    scored: false // 🆕 score lock
  }));

  /* ================= UPDATE LOOP ================= */

  function update() {
    ballData.forEach(ball => {
      if (!ball.drag) {
        ball.vel.y += gravity + buoyancy;
        ball.vel.x += Math.sin(Date.now() * 0.001 + ball.driftOffset) * driftStrength;

        ball.pos.x += ball.vel.x;
        ball.pos.y += ball.vel.y;

        const maxX = container.clientWidth - ball.radius * 2;
        const maxY = container.clientHeight - ball.radius * 2;

        if (ball.pos.x <= 0 || ball.pos.x >= maxX) {
          ball.vel.x *= -bounce;
          ball.pos.x = Math.max(0, Math.min(maxX, ball.pos.x));
        }

        const ceilingOffset = 20;
        if (ball.pos.y <= ceilingOffset) {
          ball.vel.y *= -bounce;
          ball.pos.y = ceilingOffset;
        }

        if (ball.pos.y >= maxY) {
          ball.vel.y *= -bounce * 0.6;
          ball.pos.y = maxY;
          ball.scored = false; // reset score lock
        }

        ball.vel.x *= friction;
        ball.vel.y *= friction;
      }
      
      handleRingCollision(ball);
      checkBasket(ball);
    });

    handleCollisions();
    render();
    requestAnimationFrame(update);
  }

  /* ================= BASKET CHECK ================= */

  function checkBasket(ball) {
    if (!basket || !ring) return;

    const basketRect = basket.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const hoopX = basketRect.left - containerRect.left;
    const hoopY = basketRect.top - containerRect.top;

    const hoopWidth = ring.offsetWidth;
    const hoopHeight = basketRect.height;

    const ballCenterX = ball.pos.x + ball.radius;
    const ballTopY = ball.pos.y;

    const insideHoop =
      ballCenterX > hoopX + 10 &&
      ballCenterX < hoopX + hoopWidth - 10 &&
      ballTopY > hoopY &&
      ballTopY < hoopY + hoopHeight;

    // ✅ Score ONLY ONCE per entry
    if (insideHoop && !ball.scored && ball.vel.y > 0) {
      ball.scored = true;
      score++;
      scoreEl.textContent = score;

      // 🎯 Add downward momentum (ball drops out)
      ball.vel.y += 3;
    }
  }


  /* ================= COLLISIONS ================= */

  function handleCollisions() {
    for (let i = 0; i < ballData.length; i++) {
      for (let j = i + 1; j < ballData.length; j++) {
        const a = ballData[i];
        const b = ballData[j];

        const dx = b.pos.x - a.pos.x;
        const dy = b.pos.y - a.pos.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (dist < minDist) {
          const angle = Math.atan2(dy, dx);
          const overlap = minDist - dist;

          const pushX = Math.cos(angle) * overlap * 0.5;
          const pushY = Math.sin(angle) * overlap * 0.5;

          a.pos.x -= pushX;
          a.pos.y -= pushY;
          b.pos.x += pushX;
          b.pos.y += pushY;

          const tempX = a.vel.x;
          const tempY = a.vel.y;
          a.vel.x = b.vel.x * 0.85;
          a.vel.y = b.vel.y * 0.85;
          b.vel.x = tempX * 0.85;
          b.vel.y = tempY * 0.85;
        }
      }
    }
  }

function handleRingCollision(ball) {
  if (!basket || !ring) return;

  const ringRect = ring.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const ringX = ringRect.left - containerRect.left;
  const ringY = ringRect.top - containerRect.top;
  const ringW = ringRect.width;
  const ringH = ringRect.height;

  const ballCenterX = ball.pos.x + ball.radius;
  const ballBottomY = ball.pos.y + ball.radius * 2;

  // ---- RIM SETTINGS ----
  const rimThickness = ringH;      // collision zone
  const rimPadding = 10;           // opening gap from sides

  const leftRim = ringX;
  const rightRim = ringX + ringW;

  const holeLeft = ringX + rimPadding;
  const holeRight = ringX + ringW - rimPadding;

  const isAboveRim =
    ballBottomY >= ringY &&
    ballBottomY <= ringY + rimThickness;

  const isFalling = ball.vel.y > 0;

  const hitLeftRim =
    ballCenterX < holeLeft &&
    ballCenterX > leftRim;

  const hitRightRim =
    ballCenterX > holeRight &&
    ballCenterX < rightRim;

  // 🟠 COLLIDE ONLY WITH RIM EDGES
  if (isAboveRim && isFalling && (hitLeftRim || hitRightRim)) {
    ball.pos.y = ringY - ball.radius * 2;
    ball.vel.y *= -0.75;
    ball.vel.x += hitLeftRim ? -0.6 : 0.6;
  }
}



  /* ================= RENDER ================= */

  function render() {
    ballData.forEach(ball => {
      ball.el.style.transform =
        `translate(${ball.pos.x}px, ${ball.pos.y}px)`;
    });
  }

  /* ================= DRAG ================= */

  ballData.forEach(ball => {
    const el = ball.el;

    function startDrag(e) {
      ball.drag = true;
      ball.vel.x = ball.vel.y = 0;
      const p = e.touches ? e.touches[0] : e;
      ball.lastPointer.x = p.clientX;
      ball.lastPointer.y = p.clientY;
    }

    function drag(e) {
      if (!ball.drag) return;
      const p = e.touches ? e.touches[0] : e;

      ball.vel.x = p.clientX - ball.lastPointer.x;
      ball.vel.y = p.clientY - ball.lastPointer.y;

      ball.pos.x += ball.vel.x;
      ball.pos.y += ball.vel.y;

      ball.lastPointer.x = p.clientX;
      ball.lastPointer.y = p.clientY;
    }

    function endDrag() {
      ball.drag = false;
    }

    el.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);

    el.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', drag, { passive: true });
    window.addEventListener('touchend', endDrag);
  });

  update();
});
