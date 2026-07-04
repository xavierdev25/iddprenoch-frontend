import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [RouterOutlet, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-background">
      <app-public-header />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-public-footer />
    </div>
  `,
})
export class PublicShellComponent {}
