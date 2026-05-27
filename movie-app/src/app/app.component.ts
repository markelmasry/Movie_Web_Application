import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  // We only need RouterOutlet here. The Router will load the others!
  imports: [RouterOutlet], 
  template: `<router-outlet></router-outlet>`,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #000; /* Dark mode enabled */
    }
  `]
})
export class AppComponent {
  title = 'MovieApp';
}