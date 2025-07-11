import type { Scene } from '../types/Scene';
import type { GameEngine } from '../GameEngine';

export class SignMessageScene implements Scene {
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
      this.engine.setState('sign');
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
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.fillText('THIS IS PRACTICE', centerX, centerY - 40);
      ctx.fillText('DESTROY ALL', centerX, centerY);
      ctx.fillText('THREE TARGETS', centerX, centerY + 40);
      
      ctx.restore();
    }
  }

  cleanup(): void {
    // No cleanup needed
  }
}