import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { DistritosService } from '../../../../core/services/distritos.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TableComponent, TableColumn } from '../../../../shared/ui/table/table.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { Iglesia } from '../../../../core/models';

@Component({
  selector: 'app-iglesias-list',
  standalone: true,
  imports: [RouterLink, ButtonComponent, TableComponent, ModalComponent, PaginationComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl text-foreground">Iglesias</h1>
          <p class="text-muted text-sm mt-0.5">{{ total() }} congregaciones registradas</p>
        </div>
        <a routerLink="/admin/iglesias/nuevo">
          <app-button>+ Nueva iglesia</app-button>
        </a>
      </div>

      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <app-table
          [columns]="columns()"
          [data]="iglesias()"
          [showView]="true"
          emptyIcon="⛪"
          emptyMessage="Aún no hay iglesias registradas"
          emptyHint="Usa el botón “+ Nueva iglesia” para agregar la primera."
          (view)="onView($any($event))"
          (edit)="onEdit($any($event))"
          (delete)="confirmDelete($any($event))" />
        <app-pagination [total]="total()" [page]="page()" [limit]="limit" (pageChange)="onPage($event)" />
      </div>
    </div>

    <app-modal [isOpen]="deleteModal()" title="Eliminar iglesia" (closed)="deleteModal.set(false)">
      <p class="text-muted text-sm mb-6">
        ¿Eliminar la iglesia <strong class="text-foreground">{{ toDelete()?.nombre }}</strong>?
      </p>
      <div class="flex gap-3 justify-end">
        <app-button variant="ghost" (clicked)="deleteModal.set(false)">Cancelar</app-button>
        <app-button variant="danger" (clicked)="doDelete()">Eliminar</app-button>
      </div>
    </app-modal>
  `,
})
export class IglesiasListComponent implements OnInit {
  private readonly service = inject(IglesiasService);
  private readonly distritosService = inject(DistritosService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly limit = 20;
  iglesias = signal<Iglesia[]>([]);
  total = signal(0);
  page = signal(1);

  distritos = toSignal(this.distritosService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  deleteModal = signal(false);
  toDelete = signal<Iglesia | null>(null);

  columns = computed<TableColumn[]>(() => {
    const ds = this.distritos();
    return [
      { key: 'foto', header: 'Foto', image: row => ({ src: row['foto'], label: String(row['nombre']) }) },
      { key: 'nombre', header: 'Nombre' },
      { key: 'direccion', header: 'Dirección' },
      {
        key: 'distritoId',
        header: 'Distrito',
        badge: row => ({ text: ds.find(d => d.id === row['distritoId'])?.nombre ?? '—', color: 'teal' }),
      },
    ];
  });

  ngOnInit(): void {
    this.breadcrumb.set([
      { label: 'Admin', route: '/admin/dashboard' },
      { label: 'Iglesias' },
    ]);
    this.load();
  }

  load(): void {
    this.service.getAll({ page: this.page(), limit: this.limit }).subscribe(r => {
      this.iglesias.set(r.data);
      this.total.set(r.total);
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  onView(i: Iglesia): void {
    window.location.href = `/admin/iglesias/${i.id}`;
  }

  onEdit(i: Iglesia): void {
    window.location.href = `/admin/iglesias/${i.id}/editar`;
  }

  confirmDelete(i: Iglesia): void {
    this.toDelete.set(i);
    this.deleteModal.set(true);
  }

  doDelete(): void {
    const i = this.toDelete();
    if (!i) return;
    this.service.delete(i.id).subscribe(() => {
      this.deleteModal.set(false);
      this.toDelete.set(null);
      this.load();
    });
  }
}
