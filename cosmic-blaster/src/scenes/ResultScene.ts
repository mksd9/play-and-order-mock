import type { Scene } from '../types/Scene';
import type { GameEngine } from '../GameEngine';

export class ResultScene implements Scene {
  private engine: GameEngine;
  private startTime = 0;
  private duration = 5000; // 5 seconds

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  init(): void {
    this.startTime = Date.now();
  }

  update(_deltaTime: number): void {
    const elapsed = Date.now() - this.startTime;
    
    if (elapsed >= this.duration) {
      this.engine.setState('movie');
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.engine.getCanvas();
    
    // Result message
    const result = this.engine.getGameResult();
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    
    if (result === 'left') {
      ctx.fillText('You destroyed the', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillText('RAMEN target!', canvas.width / 2, canvas.height / 2 + 20);
    } else if (result === 'right') {
      ctx.fillText('You destroyed the', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillText('SPICY RAMEN target!', canvas.width / 2, canvas.height / 2 + 20);
    } else {
      ctx.fillText('Victory!', canvas.width / 2, canvas.height / 2);
    }
    
    // Victory message
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Well done, pilot!', canvas.width / 2, canvas.height / 2 + 80);
    
    // Countdown (optional - not shown as per spec)
    const remaining = Math.ceil((this.duration - (Date.now() - this.startTime)) / 1000);
    if (remaining > 0) {
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.fillText(`Next: ${remaining}s`, canvas.width / 2, canvas.height - 50);
    }
  }

  cleanup(): void {
    // No cleanup needed
  }
}