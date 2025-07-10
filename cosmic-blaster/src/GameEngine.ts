import { InputManager } from './ui/InputManager';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';
import { ShortMovieScene } from './scenes/ShortMovieScene';

export type GameState = 'start' | 'game' | 'result' | 'movie';

export interface Scene {
  init(): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  cleanup(): void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private inputManager: InputManager;
  private currentState: GameState = 'start';
  private scenes: Map<GameState, Scene> = new Map();
  private lastTime = 0;
  private animationId = 0;
  private gameResult: 'left' | 'right' | null = null;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.inputManager = InputManager.getInstance();
    
    this.setupCanvas();
    this.initializeScenes();
  }

  private setupCanvas(): void {
    const resizeCanvas = () => {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  private initializeScenes(): void {
    this.scenes.set('start', new StartScene(this));
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
    const currentScene = this.scenes.get(this.currentState);
    if (currentScene) {
      currentScene.update(deltaTime);
    }
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const currentScene = this.scenes.get(this.currentState);
    if (currentScene) {
      currentScene.render(this.ctx);
    }
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