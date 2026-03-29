import { Component, inject } from '@angular/core';
import { DataService, Asset, MarketplaceLink } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 class="text-5xl font-headline font-bold tracking-tight text-on-surface mb-2">The Great Exchange</h1>
        <p class="font-body text-secondary max-w-xl opacity-80 leading-relaxed">
          Browse the whispered-of blades and soul-bound steel brought forth from the depths of the Forbidden Spires. Trade gold for glory.
        </p>
      </div>
      <div class="flex gap-4 font-label">
        <div class="bg-surface-container px-4 py-2 flex items-center gap-3 border-b-2 border-primary/30">
          <span class="text-[10px] uppercase tracking-tighter opacity-50">Balance</span>
          <span class="text-primary font-bold">142,500 <span class="text-[10px]">GOLD</span></span>
        </div>
        <button (click)="fileInput.click()" class="gold-sheen text-on-primary px-6 py-2 font-bold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all">
          Appraise New Relic
        </button>
        <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden" accept=".glb,.gltf,.obj,.fbx,.stl">
      </div>
    </header>

    <!-- Asset Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      @for (asset of assets$ | async; track asset.id) {
        <div class="group bg-surface-container-low border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col">
          <!-- Asset Preview Placeholder -->
          <div class="aspect-square bg-surface-container-lowest relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent opacity-60 z-10"></div>
            <div class="absolute top-4 right-4 z-20">
              <span class="bg-primary/10 text-primary text-[10px] font-label uppercase tracking-widest px-2 py-1 border border-primary/20 backdrop-blur-md">
                {{ asset.type?.split('/')?.pop()?.toUpperCase() || 'ASSET' }}
              </span>
            </div>
            <!-- Simuliertes 3D-Vorschau-Bild oder Icon -->
            <div class="w-full h-full flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110">
               <span class="material-symbols-outlined text-6xl opacity-20">view_in_ar</span>
            </div>
          </div>

          <!-- Asset Info -->
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-headline text-2xl text-on-surface group-hover:text-primary transition-colors">{{ asset.name }}</h3>
                <p class="text-[10px] font-label uppercase tracking-[0.2em] text-secondary opacity-50">Forged in Rune Iron</p>
              </div>
              <div class="text-right">
                <p class="text-primary font-bold font-label">4,200 <span class="text-[8px]">GOLD</span></p>
              </div>
            </div>

            <!-- Marketplace Links -->
            <div class="flex flex-wrap gap-2 mb-6">
              @for (link of asset.marketplaceLinks; track link.url; let i = $index) {
                <div class="flex items-center gap-2 bg-surface-container-highest/30 px-3 py-1.5 border border-outline-variant/20 hover:border-primary/40 transition-colors">
                  <a [href]="link.url" target="_blank" class="text-[10px] font-label uppercase tracking-widest text-on-surface opacity-70 hover:opacity-100">{{ link.platform }}</a>
                  <button (click)="deleteLink(asset.id!, i)" class="text-error hover:text-on-error transition-colors">
                    <span class="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              }
            </div>

            <!-- Add Link Form -->
            <form [formGroup]="linkForm" (ngSubmit)="addLink(asset.id!)" class="mt-auto pt-4 border-t border-outline-variant/10 flex flex-col gap-3">
              <div class="flex gap-2">
                <input formControlName="platform" placeholder="Platform" class="flex-1 bg-surface-container-lowest border-none text-[10px] font-label uppercase tracking-widest px-3 py-2 focus:ring-1 focus:ring-primary transition-all placeholder:opacity-20">
                <input formControlName="url" placeholder="URL" class="flex-[2] bg-surface-container-lowest border-none text-[10px] font-label uppercase tracking-widest px-3 py-2 focus:ring-1 focus:ring-primary transition-all placeholder:opacity-20">
              </div>
              <button type="submit" [disabled]="!linkForm.valid" class="w-full py-2 border border-primary/30 text-primary text-[10px] font-label uppercase tracking-[0.2em] hover:bg-primary hover:text-on-primary transition-all disabled:opacity-20">
                Bind Marketplace Link
              </button>
            </form>
          </div>
        </div>
      }
    </div>

    <!-- Upload Progress -->
    @if (uploads.length > 0) {
      <div class="fixed bottom-8 right-8 w-80 bg-surface-container border border-primary/30 p-6 shadow-2xl z-50">
        <h4 class="font-headline text-primary mb-4">Forging in Progress...</h4>
        @for (upload of uploads; track upload.name) {
          <div class="mb-4 last:mb-0">
            <div class="flex justify-between text-[10px] font-label uppercase tracking-widest mb-2">
              <span class="truncate pr-4">{{ upload.name }}</span>
              <span>{{ upload.progress }}%</span>
            </div>
            <div class="h-1 bg-surface-container-highest overflow-hidden">
              <div class="h-full bg-primary transition-all duration-300" [style.width.%]="upload.progress"></div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .hidden { display: none; }
    :host { display: block; }
  `]
})
export class Catalog {
  private dataService = inject(DataService);
  assets$: Observable<Asset[]> = this.dataService.assets$;
  linkForm = new FormGroup({
    platform: new FormControl('', Validators.required),
    url: new FormControl('', Validators.required)
  });
  uploads: { name: string, progress: number }[] = [];

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file: File | null = input.files ? input.files[0] : null;
    if (file) {
      const upload = { name: file.name, progress: 0 };
      this.uploads.push(upload);
      
      const path = `assets/${Date.now()}_${file.name}`;
      try {
        const url = await this.dataService.uploadFile(file, path, (progress) => {
          upload.progress = progress;
        });
        await this.dataService.addAsset({
          name: file.name,
          url: url,
          type: file.type,
          status: 'draft'
        });
        this.uploads = this.uploads.filter(u => u !== upload);
      } catch (error) {
        console.error('Error uploading file:', error);
        this.uploads = this.uploads.filter(u => u !== upload);
      }
    }
  }

  async addLink(assetId: string) {
    if (this.linkForm.valid) {
      const asset = this.dataService.assets.find(a => a.id === assetId);
      if (asset) {
        const links = asset.marketplaceLinks || [];
        links.push(this.linkForm.value as MarketplaceLink);
        await this.dataService.updateAssetMarketplaceLinks(assetId, links);
        this.linkForm.reset();
      }
    }
  }

  async deleteLink(assetId: string, linkIndex: number) {
    const asset = this.dataService.assets.find(a => a.id === assetId);
    if (asset && asset.marketplaceLinks) {
      const links = [...asset.marketplaceLinks];
      links.splice(linkIndex, 1);
      await this.dataService.updateAssetMarketplaceLinks(assetId, links);
    }
  }
}
