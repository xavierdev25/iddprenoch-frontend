import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CongregantesService } from '../../../../core/services/congregantes.service';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TableComponent, TableColumn } from '../../../../shared/ui/table/table.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { Congregante } from '../../../../core/models';

@Component({
  selector: 'app-congregantes-list',
  standalone: true,
  imports: [RouterLink, ButtonComponent, TableComponent, ModalComponent, PaginationComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl text-foreground">Congregantes</h1>
          <p class="text-muted text-sm mt-0.5">{{ total() }} miembros registrados</p>
        </div>
        <a routerLink="/admin/congregantes/nuevo"><app-button>+ Nuevo congregante</app-button></a>
      </div>
      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <app-table [columns]="columns()" [data]="congregantes()" [showView]="true" [compact]="true"
          emptyIcon="👥"
          emptyMessage="Aún no hay congregantes registrados"
          emptyHint="Usa el botón “+ Nuevo congregante” para agregar el primero."
          (view)="onView($any($event))"
          (edit)="onEdit($any($event))"
          (delete)="confirmDelete($any($event))" />
        <app-pagination [total]="total()" [page]="page()" [limit]="limit" (pageChange)="onPage($event)" />
      </div>
    </div>
    <app-modal [isOpen]="deleteModal()" title="Eliminar congregante" (closed)="deleteModal.set(false)">
      <p class="text-muted text-sm mb-6">¿Eliminar a <strong class="text-foreground">{{ toDelete()?.nombre }} {{ toDelete()?.apellido }}</strong>?</p>
      <div class="flex gap-3 justify-end">
        <app-button variant="ghost" (clicked)="deleteModal.set(false)">Cancelar</app-button>
        <app-button variant="danger" (clicked)="doDelete()">Eliminar</app-button>
      </div>
    </app-modal>
  `,
})
export class CongregantesListComponent implements OnInit {
  private readonly service = inject(CongregantesService);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly catalogosService = inject(CatalogosService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly limit = 20;
  congregantes = signal<Congregante[]>([]);
  total = signal(0);
  page = signal(1);

  iglesias = toSignal(this.iglesiasService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  estadosEclesiales = toSignal(this.catalogosService.getEstadosEclesiales(), { initialValue: [] });
  deleteModal = signal(false);
  toDelete = signal<Congregante | null>(null);

  columns = computed<TableColumn[]>(() => {
    const igs = this.iglesias();
    const estados = this.estadosEclesiales();
    return [
      { key: 'foto', header: 'Foto', image: row => ({ src: row['foto'], label: `${row['nombre']} ${row['apellido']}` }) },
      { key: 'dni', header: 'DNI' },
      { key: 'nombre', header: 'Nombre', render: row => `${row['nombre']} ${row['apellido']}` },
      { key: 'iglesiaId', header: 'Iglesia', render: row => igs.find(i => i.id === row['iglesiaId'])?.nombre ?? '—' },
      { key: 'telefono', header: 'Teléfono', render: row => String(row['telefono'] ?? '—') },
      {
        key: 'estadoEclesialId',
        header: 'Estado',
        badge: row => {
          const id = Number(row['estadoEclesialId']);
          const text = estados.find(e => e.id === id)?.nombre ?? '—';
          return { text, color: id === 1 ? 'green' as const : 'gray' as const };
        },
      },
    ];
  });

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Congregantes' }]);
    this.load();
  }

  load(): void {
    this.service.getAll({ page: this.page(), limit: this.limit }).subscribe(r => {
      this.congregantes.set(r.data);
      this.total.set(r.total);
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  onView(c: Congregante): void { window.location.href = `/admin/congregantes/${c.id}`; }
  onEdit(c: Congregante): void { window.location.href = `/admin/congregantes/${c.id}/editar`; }
  confirmDelete(c: Congregante): void { this.toDelete.set(c); this.deleteModal.set(true); }
  doDelete(): void {
    const c = this.toDelete();
    if (!c) return;
    this.service.delete(c.id).subscribe(() => {
      this.deleteModal.set(false);
      this.toDelete.set(null);
      this.load();
    });
  }
}
