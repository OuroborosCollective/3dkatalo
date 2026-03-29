import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink, RouterOutlet, RouterLinkActive} from '@angular/router';
import { DataService } from './services/data.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    inject(DataService).initRealtime();
  }
}
