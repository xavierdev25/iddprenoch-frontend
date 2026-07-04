import { Component, computed, input } from '@angular/core';

type BadgeColor = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'teal';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span [class]="cls()"><ng-content /></span>`,
})
export class BadgeComponent {
  color = input<BadgeColor>('teal');

  cls = computed(() => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
    const colors: Record<BadgeColor, string> = {
      green: 'bg-success/15 text-success',
      amber: 'bg-secondary/15 text-secondary',
      red: 'bg-danger/15 text-danger',
      blue: 'bg-blue-100 text-blue-700',
      gray: 'bg-border text-muted',
      teal: 'bg-primary/15 text-primary',
    };
    return `${base} ${colors[this.color()]}`;
  });
}
