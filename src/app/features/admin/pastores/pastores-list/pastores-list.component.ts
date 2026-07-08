import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PastoresService } from '../../../../core/services/pastores.service';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { CargosService } from '../../../../core/services/cargos.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TableComponent, TableColumn } from '../../../../shared/ui/table/table.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { Pastor } from '../../../../core/models';

@Component({
  selector: 'app-pastores-list',
  standalone: true,
  imports: [RouterLink, ButtonComponent, TableComponent, ModalComponent, PaginationComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl text-foreground">Pastores</h1>
          <p class="text-muted text-sm mt-0.5">{{ total() }} pastores registrados</p>
        </div>
        <a routerLink="/admin/pastores/nuevo">
          <app-button>+ Nuevo pastor</app-button>
        </a>
      </div>

      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <app-table
          [columns]="columns()"
          [data]="pastores()"
          emptyIcon="👤"
          emptyMessage="Aún no hay pastores registrados"
          emptyHint="Usa el botón “+ Nuevo pastor” para agregar el primero."
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

    <app-modal [isOpen]="deleteModal()" title="Eliminar pastor" (closed)="deleteModal.set(false)">
      <p class="text-muted text-sm mb-6">
        ¿Eliminar a <strong class="text-foreground">{{ toDelete()?.nombrePastor }}</strong
        >?
      </p>
      <div class="flex gap-3 justify-end">
        <app-button variant="ghost" (clicked)="deleteModal.set(false)">Cancelar</app-button>
        <app-button variant="danger" (clicked)="doDelete()">Eliminar</app-button>
      </div>
    </app-modal>
  `,
})
export class PastoresListComponent implements OnInit {
  private readonly service = inject(PastoresService);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly cargosService = inject(CargosService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly limit = 20;
  pastores = signal<Pastor[]>([]);
  total = signal(0);
  page = signal(1);

  iglesias = toSignal(this.iglesiasService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  cargos = toSignal(this.cargosService.getAll({ limit: 100 }).pipe(map((r) => r.data)), {
    initialValue: [],
  });
  deleteModal = signal(false);
  toDelete = signal<Pastor | null>(null);

  columns = computed<TableColumn[]>(() => {
    const igs = this.iglesias();
    const cgs = this.cargos();
    return [
      {
        key: 'foto',
        header: 'Foto',
        image: (row) => ({ src: row['foto'], label: String(row['nombrePastor']) }),
      },
      { key: 'nombrePastor', header: 'Nombre' },
      {
        key: 'cargoId',
        header: 'Cargo',
        badge: (row) => {
          const nombre = cgs.find((c) => c.id === row['cargoId'])?.nombre ?? '—';
          const color = nombre.includes('Regional')
            ? ('amber' as const)
            : nombre.includes('Distrital')
              ? ('teal' as const)
              : ('gray' as const);
          return { text: nombre, color };
        },
      },
      {
        key: 'iglesiaId',
        header: 'Iglesia',
        render: (row) => igs.find((i) => i.id === row['iglesiaId'])?.nombre ?? '—',
      },
      { key: 'celular', header: 'Celular', render: (row) => String(row['celular'] ?? '—') },
    ];
  });

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Pastores' }]);
    this.load();
  }

  load(): void {
    this.service.getAll({ page: this.page(), limit: this.limit }).subscribe((r) => {
      this.pastores.set(r.data);
      this.total.set(r.total);
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  onEdit(p: Pastor): void {
    window.location.href = `/admin/pastores/${p.id}/editar`;
  }

  confirmDelete(p: Pastor): void {
    this.toDelete.set(p);
    this.deleteModal.set(true);
  }

  doDelete(): void {
    const p = this.toDelete();
    if (!p) return;
    this.service.delete(p.id).subscribe(() => {
      this.deleteModal.set(false);
      this.toDelete.set(null);
      this.load();
    });
  }
}
