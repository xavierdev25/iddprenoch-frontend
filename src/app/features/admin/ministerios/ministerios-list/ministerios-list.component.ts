import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MinisteriosService } from '../../../../core/services/ministerios.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TableComponent, TableColumn } from '../../../../shared/ui/table/table.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { Ministerio } from '../../../../core/models';

@Component({
  selector: 'app-ministerios-list',
  standalone: true,
  imports: [RouterLink, ButtonComponent, TableComponent, ModalComponent, PaginationComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl text-foreground">Ministerios</h1>
          <p class="text-muted text-sm mt-0.5">{{ total() }} ministerios</p>
        </div>
        <a routerLink="/admin/ministerios/nuevo"><app-button>+ Nuevo ministerio</app-button></a>
      </div>
      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <app-table [columns]="columns" [data]="ministerios()"
          emptyIcon="✝️"
          emptyMessage="Aún no hay ministerios registrados"
          emptyHint="Usa el botón “+ Nuevo ministerio” para agregar el primero."
          (edit)="onEdit($any($event))" (delete)="confirmDelete($any($event))" />
        <app-pagination [total]="total()" [page]="page()" [limit]="limit" (pageChange)="onPage($event)" />
      </div>
    </div>
    <app-modal [isOpen]="deleteModal()" title="Eliminar ministerio" (closed)="deleteModal.set(false)">
      <p class="text-muted text-sm mb-6">¿Eliminar el ministerio <strong class="text-foreground">{{ toDelete()?.nombre }}</strong>?</p>
      <div class="flex gap-3 justify-end">
        <app-button variant="ghost" (clicked)="deleteModal.set(false)">Cancelar</app-button>
        <app-button variant="danger" (clicked)="doDelete()">Eliminar</app-button>
      </div>
    </app-modal>
  `,
})
export class MinisteriosListComponent implements OnInit {
  private readonly service = inject(MinisteriosService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly limit = 20;
  ministerios = signal<Ministerio[]>([]);
  total = signal(0);
  page = signal(1);

  deleteModal = signal(false);
  toDelete = signal<Ministerio | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'slug', header: 'Slug (URL)', render: row => String(row['slug'] ?? '—') },
    { key: 'descripcion', header: 'Descripción', render: row => { const d = String(row['descripcion'] ?? ''); return d.length > 60 ? d.slice(0, 60) + '…' : d; } },
  ];

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Ministerios' }]);
    this.load();
  }

  load(): void {
    this.service.getAll({ page: this.page(), limit: this.limit }).subscribe(r => {
      this.ministerios.set(r.data);
      this.total.set(r.total);
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  onEdit(m: Ministerio): void { window.location.href = `/admin/ministerios/${m.id}/editar`; }
  confirmDelete(m: Ministerio): void { this.toDelete.set(m); this.deleteModal.set(true); }
  doDelete(): void {
    const m = this.toDelete();
    if (!m) return;
    this.service.delete(m.id).subscribe(() => {
      this.deleteModal.set(false);
      this.toDelete.set(null);
      this.load();
    });
  }
}
