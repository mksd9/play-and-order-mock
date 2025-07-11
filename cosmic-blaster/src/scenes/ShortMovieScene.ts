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
    
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simple animated "movie" effect
    const time = (Date.now() - this.startTime) / 1000;
    
    // Animated stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37 + time * 50) % canvas.width;
      const y = (i * 73 + time * 30) % canvas.height;
      const size = Math.sin(time + i) * 2 + 2;
      ctx.fillRect(x, y, size, size);
    }
    
    // Victory text animation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1 + Math.sin(time * 2) * 0.1, 1 + Math.sin(time * 2) * 0.1);
    
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', 0, -20);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Mission Accomplished', 0, 20);
    
    ctx.fillStyle = '#0ff';
    ctx.font = '20px Arial';
    ctx.fillText('Thanks for playing!', 0, 60);
    
    ctx.restore();
    
    // Particle effect
    for (let i = 0; i < 20; i++) {
      const angle = (time + i) * 0.5;
      const radius = 50 + Math.sin(time + i) * 20;
      const x = canvas.width / 2 + Math.cos(angle) * radius;
      const y = canvas.height / 2 + Math.sin(angle) * radius;
      
      ctx.fillStyle = `hsl(${(time * 100 + i * 20) % 360}, 100%, 50%)`;
      ctx.fillRect(x - 2, y - 2, 4, 4);
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