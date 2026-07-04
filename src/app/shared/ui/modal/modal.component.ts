import { Component, HostListener, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          (click)="closed.emit()">
        </div>
        <div class="relative z-10 bg-surface rounded-xl shadow-2xl w-full" [class]="sizeClass()">
          <div class="flex items-center justify-between p-6 border-b border-border">
            <h2 class="font-display text-xl font-semibold text-foreground">{{ title() }}</h2>
            <button
              type="button"
              class="text-muted hover:text-foreground transition-colors p-1 rounded"
              aria-label="Cerrar"
              (click)="closed.emit()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('');
  size = input<'md' | 'lg'>('md');
  closed = output<void>();

  sizeClass = computed(() => (this.size() === 'lg' ? 'max-w-3xl' : 'max-w-lg'));

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.closed.emit();
  }
}
