export class GameObject {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export class Spaceship extends GameObject {
  private velocity = 0;
  private invincibleTime = 0;

  constructor(x: number, y: number) {
    super(x, y, 40, 30);
  }

  update(deltaTime: number, canvasWidth: number) {
    // Update position based on velocity
    this.x += this.velocity * deltaTime;
    
    // Keep within bounds
    this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
    
    // Apply friction
    this.velocity *= 0.9;
    
    // Update invincibility
    if (this.invincibleTime > 0) {
      this.invincibleTime -= deltaTime;
    }
  }

  moveLeft(speed: number) {
    this.velocity = -speed;
  }

  moveRight(speed: number) {
    this.velocity = speed;
  }

  setInvincible(duration: number) {
    this.invincibleTime = duration;
  }

  isInvincible(): boolean {
    return this.invincibleTime > 0;
  }

  render(ctx: CanvasRenderingContext2D) {
    const isInvincible = this.isInvincible();
    
    if (isInvincible && Math.floor(Date.now() / 100) % 2) {
      // Flashing effect during invincibility
      return;
    }

    // Draw spaceship as a triangle
    ctx.fillStyle = isInvincible ? "#ff6b6b" : "#4ecdc4";
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();

    // Add details
    ctx.fillStyle = "#45b7aa";
    ctx.fillRect(this.x + this.width / 4, this.y + this.height / 2, this.width / 2, this.height / 4);
  }
}

export class Asteroid extends GameObject {
  private speed: number;
  private rotation = 0;
  private rotationSpeed: number;

  constructor(x: number, y: number, size: number, speed: number) {
    super(x, y, size, size);
    this.speed = speed;
    this.rotationSpeed = (Math.random() - 0.5) * 4;
  }

  update(deltaTime: number) {
    this.y += this.speed * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);

    // Draw asteroid as irregular shape
    ctx.fillStyle = "#8b4513";
    ctx.beginPath();
    const sides = 8;
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const radius = (this.width / 2) * (0.8 + Math.random() * 0.4);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Add darker outline
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

export class PowerUp extends GameObject {
  type: "shield" | "slowTime" | "scoreBoost";
  private bobOffset = 0;

  constructor(x: number, y: number, type: "shield" | "slowTime" | "scoreBoost") {
    super(x, y, 25, 25);
    this.type = type;
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  update(deltaTime: number) {
    this.y += 150 * deltaTime; // Slower than asteroids
    this.bobOffset += deltaTime * 3;
  }

  render(ctx: CanvasRenderingContext2D) {
    const bobAmount = Math.sin(this.bobOffset) * 3;
    const renderY = this.y + bobAmount;

    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.getColor();

    // Draw power-up
    ctx.fillStyle = this.getColor();
    ctx.beginPath();
    ctx.roundRect(this.x, renderY, this.width, this.height, 5);
    ctx.fill();

    // Draw icon
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const symbol = this.getSymbol();
    ctx.fillText(symbol, this.x + this.width / 2, renderY + this.height / 2);

    ctx.shadowBlur = 0;
  }

  private getColor(): string {
    switch (this.type) {
      case "shield": return "#00ffff";
      case "slowTime": return "#ffff00";
      case "scoreBoost": return "#00ff00";
    }
  }

  private getSymbol(): string {
    switch (this.type) {
      case "shield": return "🛡";
      case "slowTime": return "⏰";
      case "scoreBoost": return "⭐";
    }
  }
}
