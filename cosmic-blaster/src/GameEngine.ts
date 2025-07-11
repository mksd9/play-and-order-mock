import { InputManager } from './ui/InputManager';
import { StartScene } from './scenes/StartScene';
import { SignMessageScene } from './scenes/SignMessageScene';
import { SignStage } from './scenes/SignStage';
import { GameMessageScene } from './scenes/GameMessageScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';
import { ShortMovieScene } from './scenes/ShortMovieScene';
import type { Scene } from './types/Scene';

export type GameState = 'start' | 'signMessage' | 'sign' | 'gameMessage' | 'game' | 'result' | 'movie';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private inputManager: InputManager;
  private currentState: GameState = 'start';
  private scenes: Map<GameState, Scene> = new Map();
  private lastTime = 0;
  private animationId = 0;
  private gameResult: 'left' | 'right' | null = null;
  private starOffset = 0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.inputManager = InputManager.getInstance();
    
    this.setupCanvas();
    this.initializeScenes();
  }

  private setupCanvas(): void {
    this.canvas.width = 640;
    this.canvas.height = 480;
    console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
  }

  private initializeScenes(): void {
    this.scenes.set('start', new StartScene(this));
    this.scenes.set('signMessage', new SignMessageScene(this));
    this.scenes.set('sign', new SignStage(this));
    this.scenes.set('gameMessage', new GameMessageScene(this));
    this.scenes.set('game', new GameScene(this));
    this.scenes.set('result', new ResultScene(this));
    this.scenes.set('movie', new ShortMovieScene(this));
  }

  start(): void {
    this.inputManager.init();
    this.setState('start');
    this.gameLoop(0);
  }

  private gameLoop = (currentTime: number): void => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update star background animation
    this.starOffset += deltaTime * 0.05;
    if (this.starOffset > 500) {
      this.starOffset = 0;
    }
    
    const currentScene = this.scenes.get(this.currentState);
    if (currentScene) {
      currentScene.update(deltaTime);
    }
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Always render the common star background first
    this.renderStarBackground();
    
    const currentScene = this.scenes.get(this.currentState);
    if (currentScene) {
      currentScene.render(this.ctx);
    }
  }
  
  private renderStarBackground(): void {
    const ctx = this.ctx;
    const canvas = this.canvas;
    
    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Multi-layer scrolling stars background
    ctx.fillStyle = '#fff';
    
    // Fast stars (background layer)
    for (let i = 0; i < 30; i++) {
      const x = (i * 37) % canvas.width;
      const y = ((i * 73) + this.starOffset * 2) % (canvas.height + 20);
      if (y > 0) {
        ctx.globalAlpha = 0.4;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    
    // Medium stars (middle layer)
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 25; i++) {
      const x = (i * 53) % canvas.width;
      const y = ((i * 97) + this.starOffset * 3) % (canvas.height + 20);
      if (y > 0) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
    
    // Slow bright stars (foreground layer)
    ctx.globalAlpha = 1.0;
    for (let i = 0; i < 20; i++) {
      const x = (i * 71) % canvas.width;
      const y = ((i * 113) + this.starOffset * 4) % (canvas.height + 20);
      if (y > 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
    
    ctx.globalAlpha = 1.0;
  }

  setState(newState: GameState): void {
    const oldScene = this.scenes.get(this.currentState);
    if (oldScene) {
      oldScene.cleanup();
    }

    this.currentState = newState;
    const newScene = this.scenes.get(newState);
    if (newScene) {
      newScene.init();
    }
  }

  getInputState() {
    return this.inputManager.getInputState();
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  setGameResult(result: 'left' | 'right'): void {
    this.gameResult = result;
  }

  getGameResult(): 'left' | 'right' | null {
    return this.gameResult;
  }

  async requestFullscreen(): Promise<void> {
    try {
      if (this.canvas.requestFullscreen) {
        await this.canvas.requestFullscreen();
      } else if ((this.canvas as any).webkitRequestFullscreen) {
        await (this.canvas as any).webkitRequestFullscreen();
      } else if ((this.canvas as any).msRequestFullscreen) {
        await (this.canvas as any).msRequestFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
    }
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.scenes.forEach(scene => scene.cleanup());
    this.scenes.clear();
  }
}