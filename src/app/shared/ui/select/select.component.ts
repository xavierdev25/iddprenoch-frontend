import { Component, computed, input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { controlEvents } from '../control-events.util';

export interface SelectOption {
  value: number | string;
  label: string;
}

let counter = 0;

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1.5">
      <label [for]="id" class="text-sm font-medium text-foreground">
        {{ label() }}
        @if (required()) {
          <span class="text-danger ml-0.5">*</span>
        }
      </label>
      <select
        [id]="id"
        [formControl]="control()"
        class="px-3 py-2 rounded border bg-surface text-sm text-foreground
               transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        [class.border-danger]="showError()"
        [class.border-border]="!showError()">
        @if (placeholder()) {
          <option value="">{{ placeholder() }}</option>
        }
        @for (opt of options(); track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
      @if (showError()) {
        <p class="text-xs text-danger">{{ errorMessage() }}</p>
      }
    </div>
  `,
})
export class SelectComponent {
  label = input.required<string>();
  control = input.required<FormControl>();
  options = input.required<SelectOption[]>();
  placeholder = input<string>('Seleccionar…');
  required = input<boolean>(false);

  readonly id = `select-${++counter}`;

  private readonly tick = controlEvents(this.control);

  showError = computed(() => {
    this.tick();
    return this.control().invalid && this.control().touched;
  });

  errorMessage = computed(() => {
    this.tick();
    const errors = this.control().errors;
    if (!errors) return '';
    if (errors['required']) return 'Este campo es requerido';
    return 'Valor inválido';
  });
}
