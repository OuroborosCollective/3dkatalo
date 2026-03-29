import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import * as pc from 'playcanvas';

@Component({
  selector: 'app-playcanvas-preview',
  standalone: true,
  template: `
    <div #canvasContainer class="w-full h-full bg-neutral-900 rounded-xl overflow-hidden relative">
      <canvas #canvas class="w-full h-full block"></canvas>
      @if (loading) {
        <div class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="text-white flex flex-col items-center gap-2">
            <span class="material-icons animate-spin">refresh</span>
            <span class="text-xs font-mono uppercase tracking-widest">Loading Model...</span>
          </div>
        </div>
      }
      @if (error) {
        <div class="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm">
          <div class="text-red-400 flex flex-col items-center gap-2">
            <span class="material-icons">error_outline</span>
            <span class="text-xs font-mono uppercase tracking-widest">{{ error }}</span>
          </div>
        </div>
      }
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
    this.app = new pc.Application(canvas, {
      mouse: new pc.Mouse(canvas),
      touch: new pc.TouchDevice(canvas),
      elementInput: new pc.ElementInput(canvas),
      graphicsDeviceOptions: { alpha: true }
    });

    this.app.setCanvasFillMode(pc.FILLMODE_NONE);
    this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
    this.app.start();

    // Camera
    this.camera = new pc.Entity('camera');
    this.camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.1, 0.1, 0)
    });
    this.camera.setPosition(0, 0, 3);
    this.app.root.addChild(this.camera);

    // Light
    this.light = new pc.Entity('light');
    this.light.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1, 1, 1),
      castShadows: true,
      shadowBias: 0.05,
      normalOffsetBias: 0.03,
      shadowDistance: 10
    });
    this.light.setEulerAngles(45, 45, 0);
    this.app.root.addChild(this.light);

    // Ambient light
    this.app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);

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

  private loadModel() {
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
        this.error = 'Failed to load model';
        console.error(err);
        return;
      }

      this.entity = (asset!.resource as { instantiateRenderEntity: () => pc.Entity }).instantiateRenderEntity();
      this.app.root.addChild(this.entity!);

      // Center and scale model
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
        const scale = 1.0 / maxExtent;

        this.entity!.setLocalScale(scale, scale, scale);
        this.entity!.setLocalPosition(-center.x * scale, -center.y * scale, -center.z * scale);
      }

      // Add simple rotation
      this.app.on('update', (dt) => {
        if (this.entity) {
          this.entity.rotate(0, 10 * dt, 0);
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
