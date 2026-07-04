import { Component, input, output } from '@angular/core';
import { BadgeComponent } from '../badge/badge.component';
import { EntityImageComponent } from '../entity-image/entity-image.component';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TableRow = Record<string, any>;

type BadgeColor = 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'teal';

export interface TableColumn {
  key: string;
  header: string;
  render?: (row: TableRow) => string;
  badge?: (row: TableRow) => { text: string; color: BadgeColor };
  /** Renders a small thumbnail (photo or initials placeholder) instead of text. */
  image?: (row: TableRow) => { src: string | undefined; label: string };
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [BadgeComponent, EntityImageComponent],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-background">
            @for (col of columns(); track col.key) {
              <th class="px-4 text-left font-semibold text-muted text-xs uppercase tracking-wide" [class]="compact() ? 'py-2' : 'py-3'">
                {{ col.header }}
              </th>
            }
            @if (showActions()) {
              <th class="px-4 text-right font-semibold text-muted text-xs uppercase tracking-wide" [class]="compact() ? 'py-2' : 'py-3'">
                Acciones
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of data(); track $index) {
            <tr class="border-b border-border last:border-0 hover:bg-primary/[.03] transition-colors">
              @for (col of columns(); track col.key) {
                <td class="px-4 text-foreground" [class]="compact() ? 'py-2' : 'py-3'">
                  @if (col.image) {
                    <app-entity-image
                      [src]="col.image(row).src"
                      [alt]="col.image(row).label"
                      [label]="col.image(row).label"
                      [clickable]="false"
                      class="w-9 h-9 rounded-md" />
                  } @else if (col.badge) {
                    <app-badge [color]="col.badge(row).color">{{ col.badge(row).text }}</app-badge>
                  } @else {
                    {{ col.render ? col.render(row) : String(row[col.key] ?? '—') }}
                  }
                </td>
              }
              @if (showActions()) {
                <td class="px-4" [class]="compact() ? 'py-2' : 'py-3'">
                  <div class="flex justify-end gap-3">
                    @if (showView()) {
                      <button
                        type="button"
                        (click)="view.emit(row)"
                        class="text-primary hover:underline text-xs font-medium">
                        Ver
                      </button>
                    }
                    <button
                      type="button"
                      (click)="edit.emit(row)"
                      class="text-primary hover:underline text-xs font-medium">
                      Editar
                    </button>
                    <button
                      type="button"
                      (click)="delete.emit(row)"
                      class="text-danger hover:underline text-xs font-medium">
                      Eliminar
                    </button>
                  </div>
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td
                [attr.colspan]="showActions() ? columns().length + 1 : columns().length"
                class="px-4 py-14 text-center">
                <p class="text-3xl mb-2">{{ emptyIcon() }}</p>
                <p class="text-foreground text-sm font-medium">{{ emptyMessage() }}</p>
                @if (emptyHint()) {
                  <p class="text-muted text-xs mt-1">{{ emptyHint() }}</p>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class TableComponent {
  columns = input.required<TableColumn[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data = input.required<any[]>();
  showActions = input<boolean>(true);
  showView = input<boolean>(false);
  compact = input<boolean>(false);
  emptyIcon = input<string>('📭');
  emptyMessage = input<string>('No hay registros para mostrar');
  emptyHint = input<string>('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  view = output<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edit = output<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete = output<any>();

  protected readonly String = String;
}
