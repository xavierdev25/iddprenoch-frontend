import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div [class]="'bg-surface border border-border rounded-lg overflow-hidden ' + class()">
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  class = input<string>('');
}
