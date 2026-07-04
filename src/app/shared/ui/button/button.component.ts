import { Component, computed, input, output } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="cls()"
      (click)="clicked.emit($event)">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<string>('button');
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();

  cls = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary text-white hover:bg-primary-hover',
      // text-white on --color-secondary is ~3:1 contrast, below WCAG AA (4.5:1) for normal text.
      secondary: 'bg-secondary text-foreground hover:opacity-90',
      ghost: 'border border-border text-foreground hover:bg-border/60',
      danger: 'bg-danger text-white hover:opacity-90',
    };
    return `${base} ${sizes[this.size()]} ${variants[this.variant()]}`;
  });
}
