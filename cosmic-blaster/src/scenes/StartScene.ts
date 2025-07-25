import type { Scene } from '../types/Scene';
import type { GameEngine } from '../GameEngine';

export class StartScene implements Scene {
  private engine: GameEngine;
  private shootPressed = false;
  private transitionTime = 0;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  init(): void {
    this.shootPressed = false;
    this.transitionTime = 0;
  }

  update(_deltaTime: number): void {
    const input = this.engine.getInputState();
    
    if (input.shoot && !this.shootPressed) {
      this.shootPressed = true;
      this.transitionTime = Date.now();
      this.engine.requestFullscreen();
    }
    
    if (this.transitionTime > 0 && Date.now() - this.transitionTime >= 1000) {
      this.engine.setState('signMessage');
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.engine.getCanvas();
    
    // Title
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('COSMIC BLASTER', canvas.width / 2, canvas.height / 2 - 50);
    
    // Subtitle
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Tap SHOOT to start', canvas.width / 2, canvas.height / 2 + 20);
    
    // Instructions
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ccc';
    ctx.fillText('Destroy the enemy ships!', canvas.width / 2, canvas.height / 2 + 60);
    ctx.fillText('First to lose all HP loses!', canvas.width / 2, canvas.height / 2 + 80);
  }

  cleanup(): void {
    // No cleanup needed for start scene
  }
}