import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LideresService } from '../../../../core/services/lideres.service';
import { MinisteriosService } from '../../../../core/services/ministerios.service';
import { IglesiasService } from '../../../../core/services/iglesias.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TableComponent, TableColumn } from '../../../../shared/ui/table/table.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../../shared/ui/pagination/pagination.component';
import { Lider } from '../../../../core/models';

@Component({
  selector: 'app-lideres-list',
  standalone: true,
  imports: [RouterLink, ButtonComponent, TableComponent, ModalComponent, PaginationComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-display text-2xl text-foreground">Líderes</h1>
          <p class="text-muted text-sm mt-0.5">{{ total() }} líderes registrados</p>
        </div>
        <a routerLink="/admin/lideres/nuevo"><app-button>+ Nuevo líder</app-button></a>
      </div>
      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <app-table [columns]="columns()" [data]="lideres()"
          emptyIcon="🌟"
          emptyMessage="Aún no hay líderes registrados"
          emptyHint="Usa el botón “+ Nuevo líder” para agregar el primero."
          (edit)="onEdit($any($event))" (delete)="confirmDelete($any($event))" />
        <app-pagination [total]="total()" [page]="page()" [limit]="limit" (pageChange)="onPage($event)" />
      </div>
    </div>
    <app-modal [isOpen]="deleteModal()" title="Eliminar líder" (closed)="deleteModal.set(false)">
      <p class="text-muted text-sm mb-6">¿Eliminar a <strong class="text-foreground">{{ toDelete()?.nombre }} {{ toDelete()?.apellido }}</strong>?</p>
      <div class="flex gap-3 justify-end">
        <app-button variant="ghost" (clicked)="deleteModal.set(false)">Cancelar</app-button>
        <app-button variant="danger" (clicked)="doDelete()">Eliminar</app-button>
      </div>
    </app-modal>
  `,
})
export class LideresListComponent implements OnInit {
  private readonly service = inject(LideresService);
  private readonly ministeriosService = inject(MinisteriosService);
  private readonly iglesiasService = inject(IglesiasService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly limit = 20;
  lideres = signal<Lider[]>([]);
  total = signal(0);
  page = signal(1);

  ministerios = toSignal(this.ministeriosService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  iglesias = toSignal(this.iglesiasService.getAll({ limit: 100 }).pipe(map(r => r.data)), { initialValue: [] });
  deleteModal = signal(false);
  toDelete = signal<Lider | null>(null);

  columns = computed<TableColumn[]>(() => {
    const ms = this.ministerios();
    const igs = this.iglesias();
    return [
      { key: 'dni', header: 'DNI' },
      { key: 'nombre', header: 'Nombre', render: row => `${row['nombre']} ${row['apellido']}` },
      { key: 'ministerioId', header: 'Ministerio', badge: row => ({ text: ms.find(m => m.id === row['ministerioId'])?.nombre ?? '—', color: 'teal' }) },
      { key: 'iglesiaId', header: 'Iglesia', render: row => igs.find(i => i.id === row['iglesiaId'])?.nombre ?? '—' },
    ];
  });

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Líderes' }]);
    this.load();
  }

  load(): void {
    this.service.getAll({ page: this.page(), limit: this.limit }).subscribe(r => {
      this.lideres.set(r.data);
      this.total.set(r.total);
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  onEdit(l: Lider): void { window.location.href = `/admin/lideres/${l.id}/editar`; }
  confirmDelete(l: Lider): void { this.toDelete.set(l); this.deleteModal.set(true); }
  doDelete(): void {
    const l = this.toDelete();
    if (!l) return;
    this.service.delete(l.id).subscribe(() => {
      this.deleteModal.set(false);
      this.toDelete.set(null);
      this.load();
    });
  }
}
