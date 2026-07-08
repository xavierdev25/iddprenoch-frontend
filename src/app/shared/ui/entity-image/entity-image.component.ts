import { Component, computed, input, output } from '@angular/core';
import { getAvatarGradient, getInitials } from '../../../core/utils/avatar.util';

/**
 * Shows a real photo when `src` is set, otherwise a locally generated
 * initials-on-gradient placeholder — never a broken image icon or an
 * external placeholder service.
 */
@Component({
  selector: 'app-entity-image',
  standalone: true,
  host: { class: 'block overflow-hidden' },
  template: `
    @if (src(); as s) {
      <img
        [src]="s"
        [alt]="alt()"
        class="w-full h-full object-cover"
        [class.cursor-pointer]="clickable()"
        (click)="onClick()"
      />
    } @else {
      <div
        class="w-full h-full flex items-center justify-center text-white font-semibold select-none"
        [style.background]="gradient()"
        aria-hidden="true"
      >
        {{ initials() }}
      </div>
    }
  `,
})
export class EntityImageComponent {
  src = input<string | undefined>();
  alt = input.required<string>();
  /** Text used to derive initials/color; defaults to `alt`. */
  label = input<string>('');
  clickable = input<boolean>(true);

  imageClick = output<void>();

  private readonly effectiveLabel = computed(() => this.label() || this.alt());
  initials = computed(() => getInitials(this.effectiveLabel()));
  gradient = computed(() => getAvatarGradient(this.effectiveLabel()));

  onClick(): void {
    if (this.clickable()) this.imageClick.emit();
  }
}
