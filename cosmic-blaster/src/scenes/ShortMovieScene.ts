import type { Scene } from '../types/Scene';
import type { GameEngine } from '../GameEngine';
import { AssetManager } from '../assets/AssetManager';

export class ShortMovieScene implements Scene {
  private engine: GameEngine;
  private assetManager: AssetManager;
  private video: HTMLVideoElement | null = null;
  private startTime = 0;
  private duration = 10000; // 10 seconds
  private animationFrame = 0;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.assetManager = AssetManager.getInstance();
  }

  init(): void {
    this.startTime = Date.now();
    this.animationFrame = 0;
    
    // Hide controls during movie
    const controls = document.getElementById('controls');
    if (controls) {
      controls.style.display = 'none';
    }
    
    // For now, we'll create a simple animated "movie" using canvas
    // In a real implementation, you'd load and play the video
    this.video = this.assetManager.createShortMovie();
  }

  update(deltaTime: number): void {
    const elapsed = Date.now() - this.startTime;
    this.animationFrame += deltaTime;
    
    if (elapsed >= this.duration) {
      this.engine.setState('start');
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.engine.getCanvas();
    
    // CM-style commercial animation
    const time = (Date.now() - this.startTime) / 1000;
    
    // Animated gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsl(${(time * 30) % 360}, 70%, 50%)`);
    gradient.addColorStop(0.5, `hsl(${(time * 30 + 120) % 360}, 70%, 30%)`);
    gradient.addColorStop(1, `hsl(${(time * 30 + 240) % 360}, 70%, 50%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Floating product animation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 50);
    ctx.rotate(Math.sin(time) * 0.2);
    ctx.scale(1 + Math.sin(time * 3) * 0.1, 1 + Math.sin(time * 3) * 0.1);
    
    // Mock product - beverage can
    ctx.fillStyle = '#ff3366';
    ctx.fillRect(-30, -60, 60, 120);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-25, -50, 50, 20);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ENERGY', 0, -35);
    
    ctx.restore();
    
    // Commercial text animation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 + 80);
    
    const textScale = 1 + Math.sin(time * 4) * 0.3;
    ctx.scale(textScale, textScale);
    
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    
    ctx.strokeText('NEW!', 0, -40);
    ctx.fillText('NEW!', 0, -40);
    
    ctx.font = 'bold 24px Arial';
    ctx.strokeText('SUPER ENERGY', 0, -10);
    ctx.fillText('SUPER ENERGY', 0, -10);
    
    ctx.font = '18px Arial';
    ctx.strokeText('今すぐお試し！', 0, 20);
    ctx.fillText('今すぐお試し！', 0, 20);
    
    ctx.restore();
    
    // Sparkle effects
    for (let i = 0; i < 15; i++) {
      const angle = (time * 2 + i * 0.5) % (Math.PI * 2);
      const radius = 100 + Math.sin(time * 3 + i) * 30;
      const x = canvas.width / 2 + Math.cos(angle) * radius;
      const y = canvas.height / 2 + Math.sin(angle) * radius;
      
      ctx.fillStyle = '#ffff00';
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time * 5 + i);
      ctx.fillRect(-3, -1, 6, 2);
      ctx.fillRect(-1, -3, 2, 6);
      ctx.restore();
    }
    
    // Progress indicator
    const progress = (Date.now() - this.startTime) / this.duration;
    const barWidth = canvas.width * 0.8;
    const barHeight = 4;
    const barX = (canvas.width - barWidth) / 2;
    const barY = canvas.height - 30;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#0f0';
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
  }

  cleanup(): void {
    // Show controls again
    const controls = document.getElementById('controls');
    if (controls) {
      controls.style.display = 'flex';
    }
    
    if (this.video) {
      this.video.pause();
      this.video = null;
    }
  }
}