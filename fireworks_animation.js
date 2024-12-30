const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Balloon properties
const balloonColors = ['#FF5733', '#33FF57', '#3357FF', '#FFD700']; // Vibrant colors for balloons
const balloons = [
  { x: canvas.width / 2 - 150, label: '2', color: balloonColors[0], radius: 70, yOffset: 0 },
  { x: canvas.width / 2 - 50, label: '0', color: balloonColors[1], radius: 70, yOffset: 0 },
  { x: canvas.width / 2 + 50, label: '2', color: balloonColors[2], radius: 70, yOffset: 0 },
  { x: canvas.width / 2 + 150, label: '4', color: balloonColors[3], radius: 70, yOffset: 0 },
];

// Audio setup (for fireworks and Happy New Year sound)
const fireworkSound = new Audio('fireworkSound.mp3'); // Make sure to add the file
const newYearSound = new Audio('newYearSound.mp3'); // Make sure to add the file
fireworkSound.volume = 0.1;  // Adjust volume as needed
newYearSound.volume = 0.1;   // Adjust volume as needed

// Background and other initial settings
let balloonY = canvas.height / 1.5;
let balloonAlpha = 1;
let messageAlpha = 0;
let messageDisplayTime = 0;
let transitionTo2025 = false;
let drop2024 = false;
let fireworks = [];
let lastTime = 0;
let confettiParticles = [];
let explosionTriggered = false;
let show2025 = false;
let dropSpeed = 0.5; // Speed at which 2024 drops

// Random color generation
function randomColor() {
  return `${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}`;
}

function generateExplosionPoints() {
  const points = [];
  for (let i = 0; i < 150; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random();
    points.push([Math.cos(angle) * distance, Math.sin(angle) * distance]);
  }
  return points;
}

// Confetti Effect
function generateConfetti() {
  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height / 2,
      size: Math.random() * 5 + 2,
      speed: Math.random() * 3 + 1,
      angle: Math.random() * 2 * Math.PI,
      color: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
    });
  }
}

function updateConfetti() {
  confettiParticles.forEach((particle, index) => {
    particle.x += Math.cos(particle.angle) * particle.speed;
    particle.y += Math.sin(particle.angle) * particle.speed;
    if (particle.y > canvas.height) {
      confettiParticles.splice(index, 1); // Remove off-screen confetti
    }
  });
}

// Drawing functions for balloon, string, label, fireworks
function circle(x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBalloon(x, y, label, radius, color, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawBalloonString(x, y) {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 20); 
  ctx.lineTo(x, y + 100); 
  ctx.stroke();
}

function drawLabel(x, y, label, radius, glowAlpha = 0) {
  ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
  ctx.font = `${radius}px "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y + radius); 
}

function drawMessage() {
  ctx.fillStyle = `rgba(255, 255, 255, ${messageAlpha})`;
  ctx.font = "50px 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Happy New Year 2025!", canvas.width / 2, canvas.height / 2);
}

function drawWatermark() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = "18px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("Developed by Swastick Das / Surjo", canvas.width - 20, canvas.height - 20);
}

// Firework particle explosion
function firework(t, duration, startX, startY, endX, endY, color, explosionPoints) {
  const progress = t / duration;
  if (progress < 0.33) {
    const x = startX + (endX - startX) * (progress / 0.33);
    const y = startY + (endY - startY) * (progress / 0.33);
    circle(x, y, 5, color);
  } else {
    const explosionProgress = (progress - 0.33) / 0.67;
    explosionPoints.forEach(([dx, dy]) => {
      const x = endX + dx * explosionProgress * canvas.width * 0.1;
      const y = endY + dy * explosionProgress * canvas.height * 0.1;
      const fade = 1 - explosionProgress;
      circle(x, y, 3, `rgba(${color}, ${fade})`);
    });
  }
}

function animate(time) {
  const deltaTime = time - lastTime;
  lastTime = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1a1a1a");
  gradient.addColorStop(1, "#0d0d0d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Balloon animation (move upwards with slight sway)
  if (!transitionTo2025 && balloonY > canvas.height / 4) {
    balloonY -= 0.5;
    balloons.forEach((balloon, index) => {
      balloon.x += (Math.random() - 0.5) * 0.2;  // Add slight horizontal sway for natural motion
    });
  }

  // Transition from "2024" to "2025"
  if (balloonY <= canvas.height / 4) {
    if (!transitionTo2025) {
      transitionTo2025 = true;
      messageAlpha = 0;
      drop2024 = true;
      fireworkSound.play(); // Firework sound when transitioning
    }

    // Drop 2024 off the screen with animation
    if (drop2024) {
      balloons.forEach(balloon => {
        balloon.yOffset += dropSpeed; 
      });

      if (balloons[0].yOffset > canvas.height / 2) {
        // Change labels to 2025
        balloons[0].label = "2";
        balloons[1].label = "0";
        balloons[2].label = "0";
        balloons[3].label = "5";
        show2025 = true;
        drop2024 = false;
        generateConfetti();
        newYearSound.play();  // Play New Year sound after transition
      }
    }

    balloonAlpha -= 0.01;
    if (balloonAlpha <= 0) {
      messageAlpha += 0.01;
      if (messageAlpha > 1) {
        messageAlpha = 1;
      }
    }
  }

  // Draw fireworks background animation
  if (Math.random() < 0.1) {
    fireworks.push({
      startTime: time,
      duration: 2000,
      startX: Math.random() * canvas.width,
      startY: canvas.height,
      endX: Math.random() * canvas.width,
      endY: Math.random() * canvas.height * 0.5,
      color: randomColor(),
      explosionPoints: generateExplosionPoints(),
    });
  }

  fireworks = fireworks.filter((fw) => time - fw.startTime < fw.duration);

  fireworks.forEach((fw) => {
    firework(
      time - fw.startTime,
      fw.duration,
      fw.startX,
      fw.startY,
      fw.endX,
      fw.endY,
      fw.color,
      fw.explosionPoints
    );
  });

  // Draw balloons and strings centered, side by side
  balloons.forEach(balloon => {
    drawBalloon(balloon.x, balloonY + balloon.yOffset, balloon.label, balloon.radius, balloon.color, balloonAlpha);
    drawBalloonString(balloon.x, balloonY + balloon.yOffset);
    drawLabel(balloon.x, balloonY + balloon.yOffset, balloon.label, balloon.radius, balloonAlpha);
  });

  // Draw the Happy New Year message after balloons transition
  if (messageAlpha > 0) {
    drawMessage();
  }

  // Draw confetti particles if any
  updateConfetti();
  confettiParticles.forEach(particle => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
    ctx.fillStyle = particle.color;
    ctx.fill();
  });

  // Draw the watermark
  drawWatermark();

  requestAnimationFrame(animate);
}

animate(0);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});