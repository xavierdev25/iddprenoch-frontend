import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-chip',
  standalone: true,
  template: `
    <button
      type="button"
      [class]="cls()"
      (click)="selected.emit()">
      <ng-content />
    </button>
  `,
})
export class ChipComponent {
  active = input<boolean>(false);
  selected = output<void>();

  cls = computed(() => {
    const base =
      'px-4 py-2 rounded-full text-[13px] font-medium border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary';
    return this.active()
      ? `${base} bg-secondary border-secondary text-[#241a06]`
      : `${base} bg-white/[.06] border-white/[.14] text-[#EDEBE4] hover:bg-secondary hover:border-secondary hover:text-[#241a06]`;
  });
}
