import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <div class="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
        <span class="text-muted">
          Página {{ page() }} de {{ totalPages() }} · {{ total() }} registros
        </span>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="px-3 py-1.5 rounded border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-border/60 transition-colors cursor-pointer"
            [disabled]="page() <= 1"
            (click)="goTo(page() - 1)"
          >
            ← Anterior
          </button>

          @for (p of pages(); track p) {
            <button
              type="button"
              class="w-8 h-8 rounded text-sm transition-colors cursor-pointer"
              [class]="
                p === page() ? 'bg-primary text-white' : 'text-foreground hover:bg-border/60'
              "
              (click)="goTo(p)"
            >
              {{ p }}
            </button>
          }

          <button
            type="button"
            class="px-3 py-1.5 rounded border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-border/60 transition-colors cursor-pointer"
            [disabled]="page() >= totalPages()"
            (click)="goTo(page() + 1)"
          >
            Siguiente →
          </button>
        </div>
      </div>
    }
  `,
})
export class PaginationComponent {
  total = input.required<number>();
  page = input.required<number>();
  limit = input<number>(20);

  pageChange = output<number>();

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit())));

  pages = computed(() => {
    const totalPages = this.totalPages();
    const current = this.page();
    // Ventana simple de hasta 5 números de página alrededor de la página actual.
    const windowSize = 5;
    let start = Math.max(1, current - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  goTo(p: number): void {
    if (p < 1 || p > this.totalPages() || p === this.page()) return;
    this.pageChange.emit(p);
  }
}
