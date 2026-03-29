import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentData } from 'firebase/firestore';

interface CategoryNode {
  id: string;
  name: string;
  parentId?: string;
  children?: CategoryNode[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="mb-10">
      <h1 class="text-5xl font-headline font-bold tracking-tight text-on-surface mb-2">The Archivist's Ledger</h1>
      <p class="font-body text-secondary max-w-xl opacity-80 leading-relaxed">
        Organize the vast collections of Relic & Rune. Categorize by steel, soul, or origin to maintain the order of the Forbidden Spires.
      </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <!-- Add Category Panel -->
      <div class="lg:col-span-1">
        <div class="bg-surface-container-low border border-outline-variant/10 p-8">
          <h3 class="font-headline text-2xl text-primary mb-6">New Archive Entry</h3>
          <div class="space-y-6">
            <div>
              <label class="block text-[10px] font-label uppercase tracking-widest text-secondary mb-2">Category Name</label>
              <input [(ngModel)]="newCategoryName" placeholder="e.g. Forbidden Blades" 
                class="w-full bg-surface-container-lowest border-none text-sm font-label uppercase tracking-widest px-4 py-3 focus:ring-1 focus:ring-primary transition-all placeholder:opacity-20">
            </div>
            <div>
              <label class="block text-[10px] font-label uppercase tracking-widest text-secondary mb-2">Parent Archive (Optional)</label>
              <select [(ngModel)]="selectedParentId" 
                class="w-full bg-surface-container-lowest border-none text-sm font-label uppercase tracking-widest px-4 py-3 focus:ring-1 focus:ring-primary transition-all appearance-none text-on-surface/70">
                <option [value]="undefined">Root Category</option>
                @for (cat of flatCategories; track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
            <button (click)="addCategory()" [disabled]="!newCategoryName" 
              class="w-full py-4 gold-sheen text-on-primary font-label font-bold uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-20 disabled:grayscale">
              Forge Category
            </button>
          </div>
        </div>
      </div>

      <!-- Category Tree View -->
      <div class="lg:col-span-2">
        <div class="bg-surface-container-low border border-outline-variant/10 p-8 min-h-[500px]">
          <h3 class="font-headline text-2xl text-on-surface mb-8">Archive Hierarchy</h3>
          
          <div class="space-y-2">
            @for (node of treeData; track node.id) {
              <ng-container *ngTemplateOutlet="treeNode; context: { $implicit: node, depth: 0 }"></ng-container>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Recursive Tree Node Template -->
    <ng-template #treeNode let-node let-depth="depth">
      <div class="group">
        <div class="flex items-center justify-between py-3 px-4 hover:bg-surface-container-highest/20 transition-colors border-l-2"
             [style.margin-left.px]="depth * 24"
             [class.border-primary]="depth === 0"
             [class.border-outline-variant]="depth > 0">
          <div class="flex items-center gap-4">
            @if (node.children && node.children.length > 0) {
              <button (click)="node.isExpanded = !node.isExpanded" class="text-primary hover:scale-125 transition-transform">
                <span class="material-symbols-outlined text-sm">
                  {{ node.isExpanded ? 'expand_more' : 'chevron_right' }}
                </span>
              </button>
            } @else {
              <span class="w-4"></span>
            }
            <span class="material-symbols-outlined text-lg opacity-30">folder</span>
            <span class="font-label uppercase tracking-widest text-sm text-on-surface/80 group-hover:text-on-surface transition-colors">{{ node.name }}</span>
          </div>
          
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button (click)="deleteCategory(node.id)" class="text-error hover:bg-error/10 p-1.5 transition-colors">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </div>
        
        @if (node.isExpanded && node.children && node.children.length > 0) {
          <div class="mt-1">
            @for (child of node.children; track child.id) {
              <ng-container *ngTemplateOutlet="treeNode; context: { $implicit: child, depth: depth + 1 }"></ng-container>
            }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23e9c176'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-position: right 1rem center; background-repeat: no-repeat; background-size: 1.5em; }
  `]
})
export class CategoryManager implements OnInit {
  private dataService = inject(DataService);
  newCategoryName = '';
  selectedParentId?: string;
  
  treeData: CategoryNode[] = [];
  flatCategories: DocumentData[] = [];

  ngOnInit() {
    this.dataService.categories$.subscribe(categories => {
      this.flatCategories = categories;
      this.treeData = this.buildTree(categories);
    });
  }

  buildTree(categories: DocumentData[]): CategoryNode[] {
    const map = new Map<string, CategoryNode>();
    categories.forEach(cat => map.set(cat.id, { id: cat.id, name: cat.name, parentId: cat.parentId, children: [], isExpanded: true }));
    
    const roots: CategoryNode[] = [];
    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)?.children?.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  async addCategory() {
    if (this.newCategoryName) {
      await this.dataService.addCategory(this.newCategoryName, this.selectedParentId);
      this.newCategoryName = '';
      this.selectedParentId = undefined;
    }
  }

  async deleteCategory(id: string) {
    if (confirm('Are you sure you want to dissolve this archive category?')) {
      await this.dataService.deleteCategory(id);
    }
  }
}
