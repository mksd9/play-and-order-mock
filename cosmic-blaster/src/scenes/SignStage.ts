import type { Scene } from '../types/Scene';
import type { GameEngine } from '../GameEngine';
import { AssetManager } from '../assets/AssetManager';

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
  baseX: number;
  animationOffset: number;
  signText: string; // サインのテキスト
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  sprite?: HTMLCanvasElement;
}

export class SignStage implements Scene {
  private engine: GameEngine;
  private assetManager: AssetManager;
  private player: Entity;
  private targets: Entity[];
  private bullets: Bullet[];
  private lastShotTime = 0;
  private shotCooldown = 200; // ms
  private shootPressed = false;
  private targetsDestroyed = 0;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.assetManager = AssetManager.getInstance();
    
    this.player = {
      x: 0, y: 0, width: 32, height: 32,
      vx: 0, vy: 0, hp: 1, active: true,
      baseX: 0, animationOffset: 0, signText: ''
    };
    
    this.targets = [];
    this.bullets = [];
  }

  init(): void {
    this.assetManager.clearCache();
    
    const canvas = this.engine.getCanvas();
    
    // Initialize player
    this.player.x = canvas.width / 2 - 16;
    this.player.y = canvas.height - 60;
    this.player.hp = 1;
    this.player.active = true;
    this.player.baseX = canvas.width / 2 - 16;
    this.player.animationOffset = 0;
    this.player.signText = '';
    this.player.sprite = this.assetManager.createPlayerSprite();
    
    // Initialize 3 sign targets
    const targetSpacing = canvas.width / 4;
    this.targets = [
      {
        x: targetSpacing - 96,
        y: canvas.height / 2 - 96,
        width: 192,
        height: 192,
        vx: 0,
        vy: 0,
        hp: 5,
        active: true,
        sprite: this.assetManager.createSignSprite(),
        baseX: targetSpacing - 96,
        animationOffset: 0,
        signText: 'BOSTON'
      },
      {
        x: targetSpacing * 2 - 96,
        y: canvas.height / 2 - 96,
        width: 192,
        height: 192,
        vx: 0,
        vy: 0,
        hp: 5,
        active: true,
        sprite: this.assetManager.createSignSprite(),
        baseX: targetSpacing * 2 - 96,
        animationOffset: Math.PI / 3,
        signText: 'RAMEN'
      },
      {
        x: targetSpacing * 3 - 96,
        y: canvas.height / 2 - 96,
        width: 192,
        height: 192,
        vx: 0,
        vy: 0,
        hp: 5,
        active: true,
        sprite: this.assetManager.createSignSprite(),
        baseX: targetSpacing * 3 - 96,
        animationOffset: Math.PI / 6,
        signText: 'BOSTON'
      }
    ];
    
    this.bullets = [];
    this.lastShotTime = 0;
    this.shootPressed = false;
    this.targetsDestroyed = 0;
  }

  update(_deltaTime: number): void {
    const input = this.engine.getInputState();
    const canvas = this.engine.getCanvas();
    
    // Update target animations (swaying motion)
    const currentTime = Date.now() / 1000;
    this.targets.forEach(target => {
      if (target.active) {
        const swayAmount = 15;
        const swaySpeed = 1.5;
        target.x = target.baseX + Math.sin(currentTime * swaySpeed + target.animationOffset) * swayAmount;
      }
    });
    
    // Update player movement
    this.player.vx = 0;
    if (input.left) this.player.vx = -5;
    if (input.right) this.player.vx = 5;
    
    this.player.x += this.player.vx;
    this.player.x = Math.max(0, Math.min(canvas.width - this.player.width, this.player.x));
    
    // Handle shooting
    if (input.shoot && !this.shootPressed && Date.now() - this.lastShotTime > this.shotCooldown) {
      this.createBullet();
      this.lastShotTime = Date.now();
      this.shootPressed = true;
    } else if (!input.shoot) {
      this.shootPressed = false;
    }
    
    // Update bullets
    this.bullets = this.bullets.filter(bullet => {
      bullet.y += bullet.vy;
      bullet.x += bullet.vx;
      
      if (bullet.y < 0 || bullet.y > canvas.height || 
          bullet.x < 0 || bullet.x > canvas.width) {
        return false;
      }
      
      return bullet.active;
    });
    
    // Check collisions
    this.checkCollisions();
    
    // Check completion condition (all 3 targets destroyed)
    const activeTargets = this.targets.filter(t => t.active && t.hp > 0);
    if (activeTargets.length === 0) {
      // All sign targets destroyed, move to game message then game stage
      this.engine.setState('gameMessage');
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
            this.targetsDestroyed++;
          }
        }
      });
    });
  }

  private isColliding(bullet: Bullet, target: Entity): boolean {
    // Simple rectangular collision for sign targets
    return bullet.x < target.x + target.width &&
           bullet.x + 4 > target.x &&
           bullet.y < target.y + target.height &&
           bullet.y + 8 > target.y;
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render player
    if (this.player.active && this.player.sprite) {
      ctx.drawImage(this.player.sprite, this.player.x, this.player.y);
    }
    
    // Render targets
    this.targets.forEach(target => {
      if (target.active && target.sprite) {
        ctx.drawImage(target.sprite, target.x, target.y, target.width, target.height);
        
        // Add sign text
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        
        const textX = target.x + target.width / 2;
        const textY = target.y + target.height / 2;
        
        ctx.strokeText(target.signText, textX, textY);
        ctx.fillText(target.signText, textX, textY);
        ctx.restore();
        
        // HP bar
        const barWidth = 80;
        const barHeight = 8;
        const barX = target.x + (target.width - barWidth) / 2;
        const barY = target.y - 15;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = target.hp > 2 ? '#0f0' : '#f00';
        ctx.fillRect(barX, barY, (target.hp / 5) * barWidth, barHeight);
      }
    });
    
    // Render bullets
    this.bullets.forEach(bullet => {
      if (bullet.active && bullet.sprite) {
        ctx.drawImage(bullet.sprite, bullet.x, bullet.y);
      }
    });
    
    // Render instruction text
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Destroy all signs to continue!', ctx.canvas.width / 2, 50);
    ctx.restore();
  }

  cleanup(): void {
    this.bullets = [];
  }
}