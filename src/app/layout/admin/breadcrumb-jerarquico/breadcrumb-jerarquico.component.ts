import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbItem } from '../../../core/models';

@Component({
  selector: 'app-breadcrumb-jerarquico',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (items().length > 0) {
      <nav aria-label="Jerarquía" class="flex items-center gap-1.5 text-sm">
        @for (item of items(); track $index; let last = $last) {
          @if ($index > 0) {
            <span class="text-muted">›</span>
          }
          @if (!last && item.route) {
            <a [routerLink]="item.route" class="text-primary hover:underline font-medium">
              {{ item.label }}
            </a>
          } @else {
            <span [class]="last ? 'text-foreground font-semibold' : 'text-muted'">
              {{ item.label }}
            </span>
          }
        }
      </nav>
    }
  `,
})
export class BreadcrumbJerarquicoComponent {
  items = input.required<BreadcrumbItem[]>();
}
