import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuditoriaService, FiltrosAuditoria } from '../../../core/services/auditoria.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';
import { RegistroAuditoria } from '../../../core/models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../shared/ui/select/select.component';
import { TableComponent, TableColumn } from '../../../shared/ui/table/table.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';

const FORMATO_FECHA = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'America/Lima',
});

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TableComponent,
    PaginationComponent,
  ],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="font-display text-2xl text-foreground">Auditoría</h1>
        <p class="text-muted text-sm mt-0.5">
          Inicios de sesión, cambios de membresía y de usuarios, y accesos denegados. Se conservan
          12 meses.
        </p>
      </div>

      <div class="bg-surface border border-border rounded-xl p-6 mb-5">
        <form [formGroup]="filtros" class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <app-select
            label="Resultado"
            [control]="filtros.controls.resultado"
            [options]="resultadoOptions"
            placeholder="Todos"
          />
          <app-input
            label="Acción"
            [control]="filtros.controls.accion"
            placeholder="Ej. LOGIN, EDITAR"
          />
          <app-input label="Desde" type="date" [control]="filtros.controls.desde" />
          <app-input label="Hasta" type="date" [control]="filtros.controls.hasta" />
          <div class="flex gap-2">
            <app-button (clicked)="aplicar()">Filtrar</app-button>
            <app-button variant="ghost" (clicked)="limpiar()">Limpiar</app-button>
          </div>
        </form>
      </div>

      @if (error(); as mensaje) {
        <div
          class="px-3 py-2.5 mb-5 rounded bg-danger/10 border border-danger/20 text-danger text-sm"
        >
          {{ mensaje }}
        </div>
      }

      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <app-table
          [columns]="columns"
          [data]="registros()"
          [showActions]="false"
          [compact]="true"
          emptyIcon="🛡️"
          emptyMessage="No hay registros con estos filtros"
        />
        <app-pagination
          [total]="total()"
          [page]="page()"
          [limit]="limit"
          (pageChange)="onPage($event)"
        />
      </div>
    </div>
  `,
})
export class AuditoriaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AuditoriaService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly limit = 50;
  registros = signal<RegistroAuditoria[]>([]);
  total = signal(0);
  page = signal(1);
  error = signal('');

  readonly resultadoOptions = [
    { value: 'DENEGADO', label: 'Denegado' },
    { value: 'PERMITIDO', label: 'Permitido' },
  ];

  filtros = this.fb.nonNullable.group({ resultado: [''], accion: [''], desde: [''], hasta: [''] });

  readonly columns: TableColumn[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (row) => FORMATO_FECHA.format(new Date(String(row['fecha']))),
    },
    {
      key: 'usuarioNombre',
      header: 'Usuario',
      render: (row) => String(row['usuarioNombre'] ?? '—'),
    },
    { key: 'accion', header: 'Acción' },
    { key: 'recurso', header: 'Recurso' },
    {
      key: 'resultado',
      header: 'Resultado',
      badge: (row) =>
        row['resultado'] === 'DENEGADO'
          ? { text: 'Denegado', color: 'red' }
          : { text: 'Permitido', color: 'green' },
    },
    { key: 'detalle', header: 'Detalle', render: (row) => String(row['detalle'] ?? '—') },
    { key: 'ip', header: 'IP', render: (row) => String(row['ip'] ?? '—') },
  ];

  ngOnInit(): void {
    this.breadcrumb.set([{ label: 'Admin', route: '/admin/dashboard' }, { label: 'Auditoría' }]);
    this.cargar();
  }

  aplicar(): void {
    this.page.set(1);
    this.cargar();
  }

  limpiar(): void {
    this.filtros.reset();
    this.aplicar();
  }

  onPage(p: number): void {
    this.page.set(p);
    this.cargar();
  }

  private cargar(): void {
    this.error.set('');
    const v = this.filtros.getRawValue();
    const filtros: FiltrosAuditoria = {
      resultado: (v.resultado || undefined) as FiltrosAuditoria['resultado'],
      accion: v.accion.trim() || undefined,
      desde: v.desde || undefined,
      hasta: v.hasta || undefined,
    };
    this.service.getAll({ page: this.page(), limit: this.limit, ...filtros }).subscribe({
      next: (r) => {
        this.registros.set(r.data);
        this.total.set(r.total);
      },
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }
}
