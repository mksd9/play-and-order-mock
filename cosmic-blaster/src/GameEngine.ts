import { InputManager } from './ui/InputManager';
import { AssetManager } from './assets/AssetManager';

export type GameState = 'start' | 'game' | 'result' | 'movie';

export interface Scene {
  init(): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  cleanup(): void;
}

// StartScene
class StartScene implements Scene {
  private engine: GameEngine;
  private shootPressed = false;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  init(): void {
    this.shootPressed = false;
  }

  update(deltaTime: number): void {
    const input = this.engine.getInputState();
    
    if (input.shoot && !this.shootPressed) {
      this.shootPressed = true;
      this.engine.requestFullscreen();
      this.engine.setState('game');
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.engine.getCanvas();
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % canvas.width;
      const y = (i * 73) % canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }
    
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('COSMIC BLASTER', canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Tap SHOOT to start', canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ccc';
    ctx.fillText('Destroy the enemy ships!', canvas.width / 2, canvas.height / 2 + 60);
    ctx.fillText('First to lose all HP loses!', canvas.width / 2, canvas.height / 2 + 80);
  }

  cleanup(): void {}
}

// GameScene
interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  active: boolean;
  sprite?: HTMLCanvasElement;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  sprite?: HTMLCanvasElement;
}

class GameScene implements Scene {
  private engine: GameEngine;
  private assetManager: AssetManager;
  private player: Entity;
  private targets: Entity[];
  private bullets: Bullet[];
  private lastShotTime = 0;
  private shotCooldown = 200;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.assetManager = AssetManager.getInstance();
    
    this.player = {
      x: 0, y: 0, width: 32, height: 32,
      vx: 0, vy: 0, hp: 1, active: true
    };
    
    this.targets = [];
    this.bullets = [];
  }

  init(): void {
    const canvas = this.engine.getCanvas();
    
    this.player.x = canvas.width / 2 - 16;
    this.player.y = canvas.height - 60;
    this.player.hp = 1;
    this.player.active = true;
    this.player.sprite = this.assetManager.createPlayerSprite();
    
    this.targets = [
      {
        x: canvas.width / 4 - 24,
        y: 50,
        width: 48,
        height: 48,
        vx: 0,
        vy: 0,
        hp: 10,
        active: true,
        sprite: this.assetManager.createTargetSprite()
      },
      {
        x: (canvas.width * 3) / 4 - 24,
        y: 50,
        width: 48,
        height: 48,
        vx: 0,
        vy: 0,
        hp: 10,
        active: true,
        sprite: this.assetManager.createTargetSprite()
      }
    ];
    
    this.bullets = [];
    this.lastShotTime = 0;
  }

  update(deltaTime: number): void {
    const input = this.engine.getInputState();
    const canvas = this.engine.getCanvas();
    
    this.player.vx = 0;
    if (input.left) this.player.vx = -5;
    if (input.right) this.player.vx = 5;
    
    this.player.x += this.player.vx;
    this.player.x = Math.max(0, Math.min(canvas.width - this.player.width, this.player.x));
    
    if (input.shoot && Date.now() - this.lastShotTime > this.shotCooldown) {
      this.createBullet();
      this.lastShotTime = Date.now();
    }
    
    this.bullets = this.bullets.filter(bullet => {
      bullet.y += bullet.vy;
      bullet.x += bullet.vx;
      
      if (bullet.y < 0 || bullet.y > canvas.height || 
          bullet.x < 0 || bullet.x > canvas.width) {
        return false;
      }
      
      return bullet.active;
    });
    
    this.checkCollisions();
    
    const activeTargets = this.targets.filter(t => t.active && t.hp > 0);
    if (activeTargets.length === 1) {
      const destroyedTarget = this.targets.find(t => !t.active || t.hp <= 0);
      if (destroyedTarget) {
        const result = destroyedTarget === this.targets[0] ? 'left' : 'right';
        this.engine.setGameResult(result);
        this.engine.setState('result');
      }
    }
  }

  private createBullet(): void {
    this.bullets.push({
      x: this.player.x + this.player.width / 2 - 2,
      y: this.player.y,
      vx: 0,
      vy: -8,
      active: true,
      sprite: this.assetManager.createBulletSprite()
    });
  }

  private checkCollisions(): void {
    this.bullets.forEach(bullet => {
      if (!bullet.active) return;
      
      this.targets.forEach(target => {
        if (!target.active || target.hp <= 0) return;
        
        if (this.isColliding(bullet, target)) {
          bullet.active = false;
          target.hp--;
          
          if (target.hp <= 0) {
            target.active = false;
          }
        }
      });
    });
  }

  private isColliding(bullet: Bullet, target: Entity): boolean {
    return bullet.x < target.x + target.width &&
           bullet.x + 4 > target.x &&
           bullet.y < target.y + target.height &&
           bullet.y + 8 > target.y;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.engine.getCanvas();
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % canvas.width;
      const y = (i * 73) % canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }
    
    if (this.player.active && this.player.sprite) {
      ctx.drawImage(this.player.sprite, this.player.x, this.player.y);
    }
    
    this.targets.forEach(target => {
      if (target.active && target.sprite) {
        ctx.drawImage(target.sprite, target.x, target.y);
        
        const barWidth = 40;
        const barHeight = 4;
        const barX = target.x + (target.width - barWidth) / 2;
        const barY = target.y - 10;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = target.hp > 3 ? '#0f0' : '#f00';
        ctx.fillRect(barX, barY, (target.hp / 10) * barWidth, barHeight);
      }
    });
    
    this.bullets.forEach(bullet => {
      if (bullet.active && bullet.sprite) {
        ctx.drawImage(bullet.sprite, bullet.x, bullet.y);
      }
    });
  }

  cleanup(): void {
    this.bullets = [];
  }
}

// ResultScene
class ResultScene implements Scene {
  private engine: GameEngine;
  private startTime = 0;
  private duration = 5000;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  init(): void {
    this.startTime = Date.now();
  }

  update(deltaTime: number): void {
    const elapsed = Date.now() - this.startTime;
    
    if (elapsed >= this.duration) {
      this.engine.setState('movie');
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.engine.getCanvas();
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % canvas.width;
      const y = (i * 73) % canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }
    
    const result = this.engine.getGameResult();
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    
    if (result === 'left') {
      ctx.fillText('You destroyed the', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillText('LEFT target!', canvas.width / 2, canvas.height / 2 + 20);
    } else if (result === 'right') {
      ctx.fillText('You destroyed the', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillText('RIGHT target!', canvas.width / 2, canvas.height / 2 + 20);
    } else {
      ctx.fillText('Victory!', canvas.width / 2, canvas.height / 2);
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Well done, pilot!', canvas.width / 2, canvas.height / 2 + 80);
  }

  cleanup(): void {}
}

// ShortMovieScene
class ShortMovieScene implements Scene {
  private engine: GameEngine;
  private startTime = 0;
  private duration = 10000;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  init(): void {
    this.startTime = Date.now();
    
    const controls = document.getElementById('controls');
    if (controls) {
      controls.style.display = 'none';
    }
  }

  update(deltaTime: number): void {
    const elapsed = Date.now() - this.startTime;
    
    if (elapsed >= this.duration) {
      this.engine.setState('start');
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.engine.getCanvas();
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const time = (Date.now() - this.startTime) / 1000;
    
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37 + time * 50) % canvas.width;
      const y = (i * 73 + time * 30) % canvas.height;
      const size = Math.sin(time + i) * 2 + 2;
      ctx.fillRect(x, y, size, size);
    }
    
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
    
    for (let i = 0; i < 20; i++) {
      const angle = (time + i) * 0.5;
      const radius = 50 + Math.sin(time + i) * 20;
      const x = canvas.width / 2 + Math.cos(angle) * radius;
      const y = canvas.height / 2 + Math.sin(angle) * radius;
      
      ctx.fillStyle = `hsl(${(time * 100 + i * 20) % 360}, 100%, 50%)`;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
    
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
    const controls = document.getElementById('controls');
    if (controls) {
      controls.style.display = 'flex';
    }
  }
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
      this.canvas.width = rect.width || 800;
      this.canvas.height = rect.height || 600;
      console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
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