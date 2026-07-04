import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DistritosService } from '../../../../core/services/distritos.service';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TableComponent, TableColumn } from '../../../../shared/ui/table/table.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { Distrito } from '../../../../core/models';

@Component({
  selector: 'app-distritos-list',
  standalone: true,
  imports: [RouterLink, ButtonComponent, TableComponent, ModalComponent, PaginationComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl text-foreground">Distritos</h1>
          <p class="text-muted text-sm mt-0.5">{{ total() }} distritos registrados</p>
        </div>
        <a routerLink="/admin/distritos/nuevo">
          <app-button>+ Nuevo distrito</app-button>
        </a>
      </div>

      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <app-table
          [columns]="columns()"
          [data]="distritos()"
          emptyIcon="🗺️"
          emptyMessage="Aún no hay distritos registrados"
          emptyHint="Usa el botón “+ Nuevo distrito” para agregar el primero."
          (edit)="onEdit($any($event))"
          (delete)="confirmDelete($any($event))" />
        <app-pagination [total]="total()" [page]="page()" [limit]="limit" (pageChange)="onPage($event)" />
      </div>
    </div>

    <app-modal [isOpen]="deleteModal()" title="Eliminar distrito" (closed)="deleteModal.set(false)">
      <p class="text-muted text-sm mb-6">
        ¿Confirmas que deseas eliminar el distrito
        <strong class="text-foreground">{{ toDelete()?.nombre }}</strong>?
        Esta acción no se puede deshacer.
      </p>
      <div class="flex gap-3 justify-end">
        <app-button variant="ghost" (clicked)="deleteModal.set(false)">Cancelar</app-button>
        <app-button variant="danger" (clicked)="doDelete()">Eliminar</app-button>
      </div>
    </app-modal>
  `,
})
export class DistritosListComponent implements OnInit {
  private readonly service = inject(DistritosService);
  private readonly breadcrumb = inject(BreadcrumbService);
  private readonly iglesiasService = inject(IglesiasService);

  readonly limit = 20;
  distritos = signal<Distrito[]>([]);
  total = signal(0);
  page = signal(1);

  iglesias = toSignal(this.iglesiasService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  deleteModal = signal(false);
  toDelete = signal<Distrito | null>(null);

  columns = computed<TableColumn[]>(() => {
    const igs = this.iglesias();
    return [
      { key: 'nombre', header: 'Nombre' },
      {
        key: 'id',
        header: 'Iglesias',
        badge: row => {
          const n = igs.filter(i => i.distritoId === row['id']).length;
          return { text: `${n} iglesia${n === 1 ? '' : 's'}`, color: 'teal' };
        },
      },
    ];
  });

  ngOnInit(): void {
    this.breadcrumb.set([
      { label: 'Admin', route: '/admin/dashboard' },
      { label: 'Distritos' },
    ]);
    this.load();
  }

  load(): void {
    this.service.getAll({ page: this.page(), limit: this.limit }).subscribe(r => {
      this.distritos.set(r.data);
      this.total.set(r.total);
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  onEdit(d: Distrito): void {
    window.location.href = `/admin/distritos/${d.id}/editar`;
  }

  confirmDelete(d: Distrito): void {
    this.toDelete.set(d);
    this.deleteModal.set(true);
  }

  doDelete(): void {
    const d = this.toDelete();
    if (!d) return;
    this.service.delete(d.id).subscribe(() => {
      this.deleteModal.set(false);
      this.toDelete.set(null);
      this.load();
    });
  }
}
