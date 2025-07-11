import type { Scene } from '../types/Scene';
import type { GameEngine } from '../GameEngine';

export class GameMessageScene implements Scene {
  private engine: GameEngine;
  private startTime = 0;
  private maxBlinks = 5;
  private blinkDuration = 500; // ms per blink

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  init(): void {
    this.startTime = Date.now();
  }

  update(_deltaTime: number): void {
    const elapsed = Date.now() - this.startTime;
    const totalDuration = this.maxBlinks * this.blinkDuration * 2; // 2 for on/off cycle
    
    if (elapsed >= totalDuration) {
      this.engine.setState('game');
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.engine.getCanvas();
    const elapsed = Date.now() - this.startTime;
    const blinkCycle = elapsed % (this.blinkDuration * 2);
    const shouldShow = blinkCycle < this.blinkDuration;
    const currentBlink = Math.floor(elapsed / (this.blinkDuration * 2));
    
    if (shouldShow && currentBlink < this.maxBlinks) {
      ctx.save();
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.fillText('NOW THE REAL THING', centerX, centerY - 40);
      ctx.fillText('DESTROY ONE OF', centerX, centerY);
      ctx.fillText('TWO TARGETS', centerX, centerY + 40);
      
      ctx.restore();
    }
  }

  cleanup(): void {
    // No cleanup needed
  }
}