import { Component, computed, input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { controlEvents } from '../control-events.util';

let counter = 0;

@Component({
  selector: 'app-input',
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
      <input
        [id]="id"
        [type]="type()"
        [formControl]="control()"
        [placeholder]="placeholder()"
        class="px-3 py-2 rounded border bg-surface text-sm text-foreground placeholder:text-muted
               transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        [class.border-danger]="showError()"
        [class.border-border]="!showError()"
      />
      @if (showError()) {
        <p class="text-xs text-danger">{{ errorMessage() }}</p>
      }
    </div>
  `,
})
export class InputComponent {
  label = input.required<string>();
  control = input.required<FormControl>();
  type = input<string>('text');
  placeholder = input<string>('');
  required = input<boolean>(false);

  readonly id = `input-${++counter}`;

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
    if (errors['email']) return 'Dirección de email inválida';
    if (errors['minlength'])
      return `Mínimo ${(errors['minlength'] as { requiredLength: number }).requiredLength} caracteres`;
    if (errors['maxlength'])
      return `Máximo ${(errors['maxlength'] as { requiredLength: number }).requiredLength} caracteres`;
    if (errors['pattern']) return 'Formato inválido';
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';
    return 'Valor inválido';
  });
}
