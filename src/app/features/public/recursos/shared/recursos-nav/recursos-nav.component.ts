import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-recursos-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="flex flex-wrap gap-2 mb-10" aria-label="Navegación de recursos">
      <a
        routerLink="/recursos/plan-estrategico"
        routerLinkActive="bg-primary text-white border-primary"
        class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-border text-foreground hover:border-primary/40 transition-colors"
      >
        <span>📋</span>Plan Estratégico
      </a>
      <a
        routerLink="/recursos/plan-operativo"
        routerLinkActive="bg-primary text-white border-primary"
        class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-border text-foreground hover:border-primary/40 transition-colors"
      >
        <span>🗓️</span>Plan Operativo
      </a>
      <a
        routerLink="/recursos/accesos-adicionales"
        routerLinkActive="bg-primary text-white border-primary"
        class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-border text-foreground hover:border-primary/40 transition-colors"
      >
        <span>🗃️</span>Accesos Adicionales
      </a>
    </nav>
  `,
})
export class RecursosNavComponent {}
