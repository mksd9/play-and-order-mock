export interface Scene {
  init(): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  cleanup(): void;
}