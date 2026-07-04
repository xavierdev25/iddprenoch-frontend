import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../../../core/services/usuarios.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TableComponent, TableColumn } from '../../../../shared/ui/table/table.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { Usuario } from '../../../../core/models';

const ROL_BADGE: Record<number, { text: string; color: 'teal' | 'blue' | 'amber' | 'gray' }> = {
  1: { text: 'Administrador', color: 'teal' },
  2: { text: 'Secretaria', color: 'blue' },
  3: { text: 'Tesorero', color: 'amber' },
  4: { text: 'Editor', color: 'gray' },
};
const ESTADO_BADGE: Record<number, { text: string; color: 'green' | 'gray' }> = {
  1: { text: 'Activo', color: 'green' },
  2: { text: 'Inactivo', color: 'gray' },
};

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [RouterLink, ButtonComponent, TableComponent, ModalComponent, PaginationComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl text-foreground">Usuarios del sistema</h1>
          <p class="text-muted text-sm mt-0.5">{{ total() }} usuarios registrados</p>
        </div>
        <a routerLink="/admin/usuarios/nuevo"><app-button>+ Nuevo usuario</app-button></a>
      </div>
      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <app-table [columns]="columns" [data]="usuarios()"
          emptyIcon="🔐"
          emptyMessage="Aún no hay usuarios registrados"
          emptyHint="Usa el botón “+ Nuevo usuario” para agregar el primero."
          (edit)="onEdit($any($event))" (delete)="confirmDelete($any($event))" />
        <app-pagination [total]="total()" [page]="page()" [limit]="limit" (pageChange)="onPage($event)" />
      </div>
    </div>
    <app-modal [isOpen]="deleteModal()" title="Eliminar usuario" (closed)="deleteModal.set(false)">
      <p class="text-muted text-sm mb-6">¿Eliminar al usuario <strong class="text-foreground">{{ toDelete()?.nombre }}</strong>?</p>
      <div class="flex gap-3 justify-end">
        <app-button variant="ghost" (clicked)="deleteModal.set(false)">Cancelar</app-button>
        <app-button variant="danger" (clicked)="doDelete()">Eliminar</app-button>
      </div>
    </app-modal>
  `,
})
export class UsuariosListComponent implements OnInit {
  private readonly service = inject(UsuariosService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly limit = 20;
  usuarios = signal<Usuario[]>([]);
  total = signal(0);
  page = signal(1);

  deleteModal = signal(false);
  toDelete = signal<Usuario | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'email', header: 'Email', render: row => String(row['email'] ?? '—') },
    { key: 'rolId', header: 'Rol', badge: row => ROL_BADGE[Number(row['rolId'])] ?? { text: '—', color: 'gray' } },
    { key: 'estadoId', header: 'Estado', badge: row => ESTADO_BADGE[Number(row['estadoId'])] ?? { text: '—', color: 'gray' } },
  ];

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Usuarios' }]);
    this.load();
  }

  load(): void {
    this.service.getAll({ page: this.page(), limit: this.limit }).subscribe(r => {
      this.usuarios.set(r.data);
      this.total.set(r.total);
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  onEdit(u: Usuario): void { window.location.href = `/admin/usuarios/${u.id}/editar`; }
  confirmDelete(u: Usuario): void { this.toDelete.set(u); this.deleteModal.set(true); }
  doDelete(): void {
    const u = this.toDelete();
    if (!u) return;
    this.service.delete(u.id).subscribe(() => {
      this.deleteModal.set(false);
      this.toDelete.set(null);
      this.load();
    });
  }
}
