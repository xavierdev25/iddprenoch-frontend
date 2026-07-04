import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventosService } from '../../../../core/services/eventos.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TableComponent, TableColumn } from '../../../../shared/ui/table/table.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { Evento } from '../../../../core/models';

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [RouterLink, ButtonComponent, TableComponent, ModalComponent, PaginationComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl text-foreground">Eventos</h1>
          <p class="text-muted text-sm mt-0.5">{{ total() }} eventos</p>
        </div>
        <a routerLink="/admin/eventos/nuevo"><app-button>+ Nuevo evento</app-button></a>
      </div>
      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <app-table [columns]="columns" [data]="eventos()"
          emptyIcon="📅"
          emptyMessage="Aún no hay eventos registrados"
          emptyHint="Usa el botón “+ Nuevo evento” para agregar el primero."
          (edit)="onEdit($any($event))" (delete)="confirmDelete($any($event))" />
        <app-pagination [total]="total()" [page]="page()" [limit]="limit" (pageChange)="onPage($event)" />
      </div>
    </div>
    <app-modal [isOpen]="deleteModal()" title="Eliminar evento" (closed)="deleteModal.set(false)">
      <p class="text-muted text-sm mb-6">¿Eliminar el evento <strong class="text-foreground">{{ toDelete()?.nombre }}</strong>?</p>
      <div class="flex gap-3 justify-end">
        <app-button variant="ghost" (clicked)="deleteModal.set(false)">Cancelar</app-button>
        <app-button variant="danger" (clicked)="doDelete()">Eliminar</app-button>
      </div>
    </app-modal>
  `,
})
export class EventosListComponent implements OnInit {
  private readonly service = inject(EventosService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly limit = 20;
  eventos = signal<Evento[]>([]);
  total = signal(0);
  page = signal(1);

  deleteModal = signal(false);
  toDelete = signal<Evento | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'imagen', header: 'Foto', image: row => ({ src: row['imagen'], label: String(row['nombre']) }) },
    { key: 'nombre', header: 'Evento' },
    { key: 'fechaConHora', header: 'Fecha y hora', render: row => new Date(String(row['fechaConHora'])).toLocaleString('es-PE') },
    { key: 'ubicacion', header: 'Ubicación', render: row => String(row['ubicacion'] ?? '—') },
    {
      key: 'estado',
      header: 'Estado',
      badge: row => (new Date(String(row['fechaConHora'])) >= new Date()
        ? { text: 'Próximo', color: 'green' }
        : { text: 'Pasado', color: 'gray' }),
    },
  ];

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Eventos' }]);
    this.load();
  }

  load(): void {
    this.service.getAll({ page: this.page(), limit: this.limit }).subscribe(r => {
      this.eventos.set(r.data);
      this.total.set(r.total);
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  onEdit(e: Evento): void { window.location.href = `/admin/eventos/${e.id}/editar`; }
  confirmDelete(e: Evento): void { this.toDelete.set(e); this.deleteModal.set(true); }
  doDelete(): void {
    const e = this.toDelete();
    if (!e) return;
    this.service.delete(e.id).subscribe(() => {
      this.deleteModal.set(false);
      this.toDelete.set(null);
      this.load();
    });
  }
}
