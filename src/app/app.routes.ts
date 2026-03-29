import {Routes} from '@angular/router';
import { Catalog } from './components/catalog';
import { CategoryManager } from './components/category-manager';

export const routes: Routes = [
  { path: '', component: Catalog },
  { path: 'categories', component: CategoryManager }
];
