import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComunicadosService } from '../../../../core/services/comunicados.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TableComponent, TableColumn } from '../../../../shared/ui/table/table.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { Comunicado } from '../../../../core/models';

@Component({
  selector: 'app-comunicados-list',
  standalone: true,
  imports: [RouterLink, ButtonComponent, TableComponent, ModalComponent, PaginationComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl text-foreground">Comunicados</h1>
          <p class="text-muted text-sm mt-0.5">{{ total() }} comunicados</p>
        </div>
        <a routerLink="/admin/comunicados/nuevo"><app-button>+ Nuevo comunicado</app-button></a>
      </div>
      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <app-table
          [columns]="columns"
          [data]="comunicados()"
          emptyIcon="📢"
          emptyMessage="Aún no hay comunicados publicados"
          emptyHint="Usa el botón “+ Nuevo comunicado” para publicar el primero."
          (edit)="onEdit($any($event))"
          (delete)="confirmDelete($any($event))"
        />
        <app-pagination
          [total]="total()"
          [page]="page()"
          [limit]="limit"
          (pageChange)="onPage($event)"
        />
      </div>
    </div>
    <app-modal
      [isOpen]="deleteModal()"
      title="Eliminar comunicado"
      (closed)="deleteModal.set(false)"
    >
      <p class="text-muted text-sm mb-6">
        ¿Eliminar <strong class="text-foreground">{{ toDelete()?.titulo }}</strong
        >?
      </p>
      <div class="flex gap-3 justify-end">
        <app-button variant="ghost" (clicked)="deleteModal.set(false)">Cancelar</app-button>
        <app-button variant="danger" (clicked)="doDelete()">Eliminar</app-button>
      </div>
    </app-modal>
  `,
})
export class ComunicadosListComponent implements OnInit {
  private readonly service = inject(ComunicadosService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly limit = 20;
  comunicados = signal<Comunicado[]>([]);
  total = signal(0);
  page = signal(1);

  deleteModal = signal(false);
  toDelete = signal<Comunicado | null>(null);

  readonly columns: TableColumn[] = [
    {
      key: 'imagen',
      header: 'Foto',
      image: (row) => ({ src: row['imagen'], label: String(row['titulo']) }),
    },
    { key: 'titulo', header: 'Título' },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (row) => {
        const d = String(row['descripcion'] ?? '');
        return d.length > 70 ? d.slice(0, 70) + '…' : d || '—';
      },
    },
  ];

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Comunicados' }]);
    this.load();
  }

  load(): void {
    this.service.getAll({ page: this.page(), limit: this.limit }).subscribe((r) => {
      this.comunicados.set(r.data);
      this.total.set(r.total);
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  onEdit(c: Comunicado): void {
    window.location.href = `/admin/comunicados/${c.id}/editar`;
  }
  confirmDelete(c: Comunicado): void {
    this.toDelete.set(c);
    this.deleteModal.set(true);
  }
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
