<template>
  <div class="confetti-wrapper">
    <canvas ref="canvasRef" class="confetti-canvas" />
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// --- Props ---
const props = defineProps({
  count: {
    type: Number,
    default: 150,
  },
  gravity: {
    type: Number,
    default: 0.35,
  },
  wind: {
    type: Number,
    default: 0.4,
  },
  colors: {
    type: Array,
    default: () => [
      '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
      '#FF6FC8', '#C77DFF', '#00C9A7', '#FF9A3C',
      '#F72585', '#7209B7',
    ],
  },
})

// --- State ---
const canvasRef = ref(null)
let ctx = null
let animationId = null
let particles = []

// --- Particle class ---
class Particle {
  constructor(canvas) {
    this.canvas = canvas
    this.reset(true)
  }

  reset(fromTop = false) {
    const canvas = this.canvas
    this.x = Math.random() * canvas.width
    this.y = fromTop ? Math.random() * -canvas.height * 0.2 : Math.random() * canvas.height
    this.w = Math.random() * 12 + 5
    this.h = Math.random() * 6 + 3
    this.color = props.colors[Math.floor(Math.random() * props.colors.length)]
    this.opacity = Math.random() * 0.6 + 0.4
    this.speedX = (Math.random() - 0.5) * props.wind * 2
    this.speedY = Math.random() * 2 + 1
    this.angle = Math.random() * Math.PI * 2
    this.angleSpeed = (Math.random() - 0.5) * 0.12
    this.scaleX = 1
    this.scaleDir = Math.random() > 0.5 ? 1 : -1
    this.scaleSpeed = Math.random() * 0.03 + 0.01
    this.shape = Math.random() > 0.6 ? 'circle' : Math.random() > 0.5 ? 'rect' : 'ribbon'
  }

  update() {
    this.y += this.speedY + props.gravity
    this.x += this.speedX
    this.angle += this.angleSpeed
    this.scaleX += this.scaleSpeed * this.scaleDir
    if (this.scaleX > 1 || this.scaleX < -1) this.scaleDir *= -1

    // Wrap horizontal
    if (this.x > this.canvas.width + 20) this.x = -20
    if (this.x < -20) this.x = this.canvas.width + 20

    // Reset when off screen bottom
    if (this.y > this.canvas.height + 20) this.reset(true)
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle)
    ctx.scale(this.scaleX, 1)
    ctx.fillStyle = this.color

    if (this.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (this.shape === 'ribbon') {
      ctx.beginPath()
      ctx.moveTo(-this.w / 2, -this.h / 2)
      ctx.quadraticCurveTo(0, this.h / 2, this.w / 2, -this.h / 2)
      ctx.quadraticCurveTo(0, this.h * 1.5, -this.w / 2, -this.h / 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.roundRect(-this.w / 2, -this.h / 2, this.w, this.h, 2)
      ctx.fill()
    }

    ctx.restore()
  }
}

// --- Resize handler ---
function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
}

// --- Animation loop ---
function animate() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const p of particles) {
    p.update()
    p.draw(ctx)
  }

  animationId = requestAnimationFrame(animate)
}

// --- Lifecycle ---
onMounted(() => {
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')

  resize()
  window.addEventListener('resize', resize)

  // Spawn particles
  particles = Array.from({ length: props.count }, () => new Particle(canvas))

  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.confetti-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.confetti-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* Slot content sits above the canvas */
.confetti-wrapper > :deep(*:not(.confetti-canvas)) {
  position: relative;
  z-index: 1;
}
</style>