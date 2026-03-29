import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, AfterViewInit, inject } from '@angular/core';
import * as pc from 'playcanvas';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-playcanvas-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #canvasContainer class="w-full h-full bg-surface-container-lowest border border-outline-variant/10 relative overflow-hidden group">
      <!-- Runic Glow Effect -->
      <div class="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)]"></div>
      
      <canvas #canvas class="w-full h-full block cursor-grab active:cursor-grabbing z-10"></canvas>
      
      <!-- Loading Overlay -->
      @if (loading) {
        <div class="absolute inset-0 flex items-center justify-center bg-surface/60 backdrop-blur-md z-20">
          <div class="text-primary flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <span class="text-[10px] font-label uppercase tracking-[0.3em] runic-glow">Awakening Relic...</span>
          </div>
        </div>
      }
      
      <!-- Error Overlay -->
      @if (error) {
        <div class="absolute inset-0 flex items-center justify-center bg-error-container/20 backdrop-blur-md z-20">
          <div class="text-error flex flex-col items-center gap-3 p-6 border border-error/30 bg-surface">
            <span class="material-symbols-outlined text-3xl">skull</span>
            <span class="text-[10px] font-label uppercase tracking-widest text-center">{{ error }}</span>
            <button (click)="loadModel()" class="mt-2 text-[10px] font-label uppercase tracking-widest underline hover:text-on-surface">Retry Ritual</button>
          </div>
        </div>
      }

      <!-- UI Overlay -->
      <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div class="bg-surface/80 backdrop-blur-md border border-outline-variant/20 px-3 py-1.5">
          <p class="text-[8px] font-label uppercase tracking-widest text-secondary">Soul Bound Status</p>
          <p class="text-[10px] font-label uppercase tracking-widest text-primary">Synchronized</p>
        </div>
        <div class="flex gap-2">
           <button (click)="resetView()" class="p-2 bg-surface/80 backdrop-blur-md border border-outline-variant/20 text-on-surface hover:text-primary transition-colors">
             <span class="material-symbols-outlined text-sm">restart_alt</span>
           </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
  `]
})
export class PlayCanvasPreview implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') containerRef!: ElementRef<HTMLDivElement>;
  @Input() modelUrl: string | null = null;

  private app!: pc.Application;
  private entity: pc.Entity | null = null;
  private camera: pc.Entity | null = null;
  private light: pc.Entity | null = null;
  
  loading = false;
  error: string | null = null;

  ngAfterViewInit() {
    this.initPlayCanvas();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modelUrl'] && !changes['modelUrl'].firstChange) {
      this.loadModel();
    }
  }

  private initPlayCanvas() {
    const canvas = this.canvasRef.nativeElement;
    
    // PlayCanvas Application Setup
    this.app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas),
      elementInput: new pc.ElementInput(canvas),
      graphicsDeviceOptions: { alpha: true, antialias: true }
    });

    this.app.setCanvasFillMode(pc.FILLMODE_NONE);
    this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
    this.app.start();

    // Camera Setup
    this.camera = new pc.Entity('camera');
    this.camera.addComponent('camera', {
      clearColor: new pc.Color(0, 0, 0, 0)
    });
    this.camera.setPosition(0, 0.5, 3);
    this.app.root.addChild(this.camera);

    // Cinematic Lighting
    this.light = new pc.Entity('light');
    this.light.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.91, 0.75, 0.46), // Goldish light
      intensity: 1.5,
      castShadows: true,
      shadowBias: 0.05,
      normalOffsetBias: 0.03,
      shadowDistance: 10
    });
    this.light.setEulerAngles(45, 135, 0);
    this.app.root.addChild(this.light);

    // Rim Light (Backlight)
    const rimLight = new pc.Entity('rimLight');
    rimLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0, 0.86, 0.9), // Cyan/Runic glow
      intensity: 0.8
    });
    rimLight.setEulerAngles(-45, -45, 0);
    this.app.root.addChild(rimLight);

    // Ambient light
    this.app.scene.ambientLight = new pc.Color(0.05, 0.05, 0.05);

    window.addEventListener('resize', this.onResize);
    this.onResize();

    if (this.modelUrl) {
      this.loadModel();
    }
  }

  private onResize = () => {
    if (!this.containerRef) return;
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    this.app.resizeCanvas(rect.width, rect.height);
  };

  public resetView() {
    if (this.entity) {
      this.entity.setLocalEulerAngles(0, 0, 0);
    }
  }

  public loadModel() {
    if (!this.modelUrl || !this.app) return;

    this.loading = true;
    this.error = null;

    if (this.entity) {
      this.entity.destroy();
      this.entity = null;
    }

    const url = this.modelUrl;
    
    this.app.assets.loadFromUrl(url, 'container', (err, asset) => {
      this.loading = false;
      if (err) {
        this.error = 'The Ritual Failed: Relic could not be summoned';
        console.error(err);
        return;
      }

      this.entity = (asset!.resource as any).instantiateRenderEntity();
      this.app.root.addChild(this.entity!);

      // Auto-center and scale
      const renders = this.entity!.findComponents('render') as pc.RenderComponent[];
      const meshInstances: pc.MeshInstance[] = renders.reduce((acc: pc.MeshInstance[], render: pc.RenderComponent) => {
        return acc.concat(render.meshInstances);
      }, []);

      if (meshInstances.length > 0) {
        const aabb = new pc.BoundingBox();
        aabb.copy(meshInstances[0].aabb);
        for (let i = 1; i < meshInstances.length; i++) {
          aabb.add(meshInstances[i].aabb);
        }

        const center = aabb.center;
        const halfExtents = aabb.halfExtents;
        const maxExtent = Math.max(halfExtents.x, halfExtents.y, halfExtents.z);
        const scale = 1.2 / maxExtent;

        this.entity!.setLocalScale(scale, scale, scale);
        this.entity!.setLocalPosition(-center.x * scale, -center.y * scale, -center.z * scale);
      }

      // Gentle rotation
      this.app.on('update', (dt) => {
        if (this.entity) {
          this.entity.rotate(0, 15 * dt, 0);
        }
      });
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
    if (this.app) {
      this.app.destroy();
    }
  }
}
