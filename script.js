const PARTICLE_OFFSET = 9;
const ADJUST_X = -10;
const ADJUST_Y = -10;
const CONNECT_DISTANCE = 20;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const image = document.getElementById('source');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const particles = [];

// handle mouse
const mouse = {
  x: null,
  y: null,
  radius: 150,
};

window.addEventListener('mousemove', function (event) {
  mouse.x = event.x;
  mouse.y = event.y;
});

// Configure CORS access
image.crossOrigin = 'anonymous';
// Listen for image load
image.addEventListener('load', init);

// Draw text on canvas
// ctx.fillStyle = 'white';
// ctx.font = '30px Verdana';
// ctx.fillText('YEAH', 0, 30);
// // Scan the underlying pixel data of the text area
// const textCoordinates = ctx.getImageData(0, 0, 100, 100);

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 3;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 40 + 3;
    this.color = 'white';
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  update() {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const forceDirectionX = dx / distance;
    const forceDirectionY = dy / distance;
    const maxDistance = mouse.radius;
    const force = (maxDistance - distance) / maxDistance;
    const directionX = forceDirectionX * force * this.density;
    const directionY = forceDirectionY * force * this.density;

    if (distance < mouse.radius) {
      this.color = 'yellow';
      this.x -= directionX;
      this.y -= directionY;
    } else {
      if (this.x !== this.baseX) {
        const dx = this.x - this.baseX;
        this.x -= dx / 10;
      }
      if (this.y !== this.baseY) {
        const dy = this.y - this.baseY;
        this.y -= dy / 10;
      }
      this.color = 'white';
    }
  }
}

function init() {
  // Draw image onto the canvas
  ctx.drawImage(image, 0, 0, 2836, 3088, 0, 0, 100, 109);
  // Scan the underlying pixel data of the image area
  const textCoordinates = ctx.getImageData(0, 0, 100, 109);

  let index = 0;
  for (let y = 0, y2 = textCoordinates.height; y < y2; y++) {
    for (let x = 0, x2 = textCoordinates.width; x < x2; x++) {
      // Check if the opacity value of a pixel is more than 50%
      if (textCoordinates.data[index + 3] > 128) {
        const positionX = (x + ADJUST_X) * PARTICLE_OFFSET;
        const positionY = (y + ADJUST_Y) * PARTICLE_OFFSET;
        particles.push(new Particle(positionX, positionY));
      }
      index += 4;
    }
  }
}
// init();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
    particles[i].update();
  }
  connect();
  requestAnimationFrame(animate);
}
animate();

function connect() {
  let opacity = 1;
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < CONNECT_DISTANCE) {
        opacity = 1 - distance / 50;
        ctx.strokeStyle = particles[b].color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}
