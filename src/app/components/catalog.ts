import { Component, inject } from '@angular/core';
import { DataService, Asset, MarketplaceLink } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Asset Catalog</h1>
      <button mat-raised-button color="primary" (click)="fileInput.click()">
        <mat-icon>upload</mat-icon>
        Upload Model
      </button>
      <button mat-stroked-button (click)="connectToEtsy()">
        <mat-icon>link</mat-icon>
        Connect to Etsy
      </button>
      <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden" accept=".glb,.gltf,.obj,.fbx,.stl">
      
      <div class="mt-4">
        @for (asset of assets$ | async; track asset.id) {
          <div class="border p-4 mb-4 rounded shadow-sm">
            <h3 class="font-bold">{{ asset.name }}</h3>
            <div class="flex flex-wrap gap-2 my-2">
              @for (link of asset.marketplaceLinks; track link.url; let i = $index) {
                <div class="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  <a [href]="link.url" target="_blank" class="text-blue-500 underline">{{ link.platform }}</a>
                  <button mat-icon-button (click)="deleteLink(asset.id!, i)" class="!w-6 !h-6 !leading-none">
                    <mat-icon class="!text-sm !w-4 !h-4 text-red-500">delete</mat-icon>
                  </button>
                </div>
              }
            </div>
            <form [formGroup]="linkForm" (ngSubmit)="addLink(asset.id!)" class="flex gap-2">
              <mat-form-field appearance="outline">
                <mat-label>Platform</mat-label>
                <input matInput formControlName="platform" placeholder="Etsy">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>URL</mat-label>
                <input matInput formControlName="url" placeholder="https://...">
              </mat-form-field>
              <button mat-raised-button color="accent" type="submit">Add Link</button>
            </form>
          </div>
        }
      </div>
    </div>
  `,
  styles: ['.hidden { display: none; }']
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
        console.log('Asset uploaded and created');
        this.uploads = this.uploads.filter(u => u !== upload);
      } catch (error) {
        console.error('Error uploading file:', error);
        this.uploads = this.uploads.filter(u => u !== upload);
      }
    }
  }

  async connectToEtsy() {
    try {
      const response = await fetch('/api/auth/etsy/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      
      const authWindow = window.open(url, 'etsy_auth', 'width=600,height=700');
      if (authWindow) {
        authWindow.focus();
        window.addEventListener('message', (event) => {
          if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
            console.log('Etsy connected');
          }
        }, { once: true });
      }
    } catch (error) {
      console.error('Error connecting to Etsy:', error);
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
