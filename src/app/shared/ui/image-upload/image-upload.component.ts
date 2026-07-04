import { Component, OnInit, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

const MAX_BYTES = 5 * 1024 * 1024;

let counter = 0;

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1.5">
      <label [for]="id" class="text-sm font-medium text-foreground">{{ label() }}</label>
      <div class="flex items-center gap-4">
        <div class="w-20 h-20 rounded-lg overflow-hidden border border-border shrink-0 bg-background flex items-center justify-center">
          @if (preview(); as p) {
            <img [src]="p" [alt]="label()" class="w-full h-full object-cover" />
          } @else {
            <span class="text-muted text-[11px] px-1.5 text-center leading-tight">Sin imagen</span>
          }
        </div>
        <div class="flex flex-col gap-1.5">
          <input
            [id]="id"
            type="file"
            accept="image/*"
            (change)="onFileChange($event)"
            class="text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0
                   file:bg-primary/10 file:text-primary file:text-xs file:font-medium file:cursor-pointer
                   hover:file:bg-primary/20 cursor-pointer" />
          <p class="text-[11px] text-muted">JPG, PNG o WEBP. Máximo 5MB.</p>
          @if (error()) {
            <p class="text-xs text-danger">{{ error() }}</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class ImageUploadComponent implements OnInit {
  label = input<string>('Imagen');
  control = input.required<FormControl<string>>();

  readonly id = `image-upload-${++counter}`;

  error = signal('');
  // Signal, not a plain getter: this app is zoneless, and FileReader.onload fires
  // outside any Angular-tracked event, so only a signal write is guaranteed to
  // trigger a re-render (control().setValue() alone would not).
  preview = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.preview.set(this.control().value || undefined);
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    target.value = '';
    if (!file) return;

    this.error.set('');
    if (!file.type.startsWith('image/')) {
      this.error.set('El archivo debe ser una imagen (JPG, PNG, WEBP, etc.).');
      return;
    }
    if (file.size > MAX_BYTES) {
      this.error.set('La imagen no debe superar 5MB.');
      return;
    }

    // TEMPORAL: sin backend/almacenamiento real todavía, la imagen se convierte a
    // data URL y se guarda así directamente en el mock data en memoria. Cuando exista
    // el backend, reemplazar esto por un upload a almacenamiento real (S3 o disco del
    // servidor Node.js) y guardar aquí solo la URL devuelta — nunca data URLs en producción.
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.control().setValue(dataUrl);
      this.control().markAsDirty();
      this.preview.set(dataUrl);
    };
    reader.readAsDataURL(file);
  }
}
