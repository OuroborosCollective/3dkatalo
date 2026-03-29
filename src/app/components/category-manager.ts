import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { DocumentData } from 'firebase/firestore';

interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
}

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatTreeModule
  ],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Category Manager</h1>
      
      <div class="flex gap-2 mb-4">
        <mat-form-field>
          <mat-label>New Category Name</mat-label>
          <input matInput [(ngModel)]="newCategoryName">
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="addCategory()">Add Root Category</button>
      </div>

      <mat-tree [dataSource]="dataSource" [treeControl]="treeControl" class="example-tree">
        <mat-tree-node *matTreeNodeDef="let node" matTreeNodeToggle>
          <li class="mat-tree-node flex items-center gap-2">
            <button mat-icon-button disabled><mat-icon>folder</mat-icon></button>
            {{node.name}}
            <button mat-icon-button (click)="deleteCategory(node.id)"><mat-icon>delete</mat-icon></button>
          </li>
        </mat-tree-node>
        <mat-nested-tree-node *matTreeNodeDef="let node; when: hasChild">
          <li>
            <div class="mat-tree-node flex items-center gap-2">
              <button mat-icon-button matTreeNodeToggle [attr.aria-label]="'Toggle ' + node.name">
                <mat-icon class="mat-icon-rtl-mirror">
                  {{treeControl.isExpanded(node) ? 'expand_more' : 'chevron_right'}}
                </mat-icon>
              </button>
              {{node.name}}
              <button mat-icon-button (click)="deleteCategory(node.id)"><mat-icon>delete</mat-icon></button>
            </div>
            <ul [class.example-tree-invisible]="!treeControl.isExpanded(node)">
              <ng-container matTreeNodeOutlet></ng-container>
            </ul>
          </li>
        </mat-nested-tree-node>
      </mat-tree>
    </div>
  `,
  styles: [`
    .example-tree-invisible { display: none; }
    .example-tree ul, .example-tree li { list-style-type: none; }
  `]
})
export class CategoryManager implements OnInit {
  private dataService = inject(DataService);
  newCategoryName = '';
  
  treeControl = new NestedTreeControl<CategoryNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<CategoryNode>();

  ngOnInit() {
    this.dataService.categories$.subscribe(categories => {
      this.dataSource.data = this.buildTree(categories);
    });
  }

  hasChild = (_: number, node: CategoryNode) => !!node.children && node.children.length > 0;

  buildTree(categories: DocumentData[]): CategoryNode[] {
    const map = new Map<string, CategoryNode>();
    categories.forEach(cat => map.set(cat.id, { id: cat.id, name: cat.name, children: [] }));
    
    const roots: CategoryNode[] = [];
    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parentId) {
        map.get(cat.parentId)?.children?.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  async addCategory() {
    if (this.newCategoryName) {
      await this.dataService.addCategory(this.newCategoryName);
      this.newCategoryName = '';
    }
  }

  async deleteCategory(id: string) {
    await this.dataService.deleteCategory(id);
  }
}
