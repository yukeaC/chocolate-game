const canvas = document.getElementById('fireworksCanvas');
let ctx = null;
let width = window.innerWidth, height = window.innerHeight;
let particles = [];

function resizeCanvas() {
    if (!canvas) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (ctx) ctx = canvas.getContext('2d');
}
if (canvas) {
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

class Particle {
    constructor(x, y, vx, vy, color, size = 3, gravity = 0.1, alpha = 1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.gravity = gravity;
        this.alpha = alpha;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
        return this.life > 0;
    }
    draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.life * this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function burstFirework(x, y) {
    const count = 50 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        const size = 2 + Math.random() * 3;
        particles.push(new Particle(x, y, vx, vy, color, size, 0.08, 0.9));
    }
}

function randomFireworks(count = 3) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const x = 100 + Math.random() * (width - 200);
            const y = 100 + Math.random() * (height - 200);
            burstFirework(x, y);
        }, i * 120);
    }
}

function animateFireworks() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        const alive = particles[i].update();
        particles[i].draw();
        if (!alive) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animateFireworks);
}
if (ctx) animateFireworks();