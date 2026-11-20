import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AsambleasService } from '../../../core/services/asambleas.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { IglesiasService } from '../../../core/services/iglesias.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';
import { AsambleaDetalle, ElectorPadron } from '../../../core/models';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination.component';
import { AcreditacionComponent } from './acreditacion.component';
import { formatearHora } from './estado-badge';

/** Padrón de la asamblea: quiénes pueden votar y quiénes ya se acreditaron (HU08). */
@Component({
  selector: 'app-padron',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    PaginationComponent,
    AcreditacionComponent,
  ],
  template: `
    <div>
      <a [routerLink]="['/admin/asambleas', id]" class="text-sm text-muted hover:text-primary"
        >← Volver a la asamblea</a
      >
      <div class="flex flex-wrap items-center justify-between gap-3 mt-2 mb-5">
        <div>
          <h1 class="font-display text-2xl text-foreground">Padrón de electores</h1>
          <p class="text-muted text-sm mt-0.5">
            {{ asamblea()?.nombre }} · {{ total() }} en el padrón
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <app-button variant="ghost" (clicked)="modalImportar.set(true)"
            >Importar desde la membresía</app-button
          >
          <app-button (clicked)="modalAcreditar.set(true)">Acreditar elector</app-button>
        </div>
      </div>

      @if (mensaje()) {
        <div
          class="px-3 py-2.5 mb-4 rounded bg-success/10 border border-success/30 text-success text-sm"
        >
          {{ mensaje() }}
        </div>
      }
      @if (error()) {
        <div
          class="px-3 py-2.5 mb-4 rounded bg-danger/10 border border-danger/20 text-danger text-sm"
        >
          {{ error() }}
        </div>
      }

      <form class="flex gap-2 mb-4" (ngSubmit)="buscar()">
        <label class="sr-only" for="q-padron">Buscar</label>
        <input
          id="q-padron"
          name="q"
          [(ngModel)]="q"
          placeholder="Buscar por nombre o DNI"
          class="flex-1 max-w-md px-3 py-2 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <app-button type="submit" variant="ghost">Buscar</app-button>
      </form>

      <div class="bg-surface border border-border rounded-xl overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wide text-muted border-b border-border">
              <th class="px-4 py-3">DNI</th>
              <th class="px-4 py-3">Nombre</th>
              <th class="px-4 py-3">Iglesia</th>
              <th class="px-4 py-3">Acreditación</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            @for (e of electores(); track e.id) {
              <tr class="border-b border-border last:border-0">
                <td class="px-4 py-3 tabular-nums">{{ e.dni }}</td>
                <td class="px-4 py-3 font-medium text-foreground">{{ e.nombre }}</td>
                <td class="px-4 py-3 text-muted">{{ e.iglesia ?? '—' }}</td>
                <td class="px-4 py-3">
                  @if (e.acreditado) {
                    <app-badge color="green">Acreditado · {{ hora(e.acreditadoEn) }}</app-badge>
                  } @else {
                    <app-badge color="gray">Pendiente</app-badge>
                  }
                </td>
                <td class="px-4 py-3 text-right">
                  @if (e.votos === 0) {
                    <button type="button" class="text-danger hover:underline" (click)="quitar(e)">
                      Quitar
                    </button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-4 py-12 text-center text-muted">
                  El padrón está vacío. Impórtalo desde la membresía o acredita electores uno por
                  uno.
                </td>
              </tr>
            }
          </tbody>
        </table>
        <app-pagination
          [total]="total()"
          [page]="page()"
          [limit]="limit"
          (pageChange)="irA($event)"
        />
      </div>
    </div>

    <app-modal
      [isOpen]="modalAcreditar()"
      title="Acreditar elector"
      (closed)="modalAcreditar.set(false); cargar()"
    >
      <app-acreditacion [asambleaId]="id" (acreditado)="cargar()" />
    </app-modal>

    <app-modal
      [isOpen]="modalImportar()"
      title="Importar desde la membresía"
      (closed)="modalImportar.set(false)"
    >
      <div class="space-y-4">
        <p class="text-sm text-muted">
          Agrega al padrón a los congregantes registrados. Los DNI que ya están no se duplican.
          @if (asamblea()?.tipo === 'DISTRITAL') {
            En una asamblea distrital solo se importan congregantes de su distrito.
          }
        </p>
        <label class="block text-sm font-medium text-foreground" for="imp-iglesia">Iglesia</label>
        <select
          id="imp-iglesia"
          [(ngModel)]="iglesiaImportar"
          class="w-full px-3 py-2 rounded border border-border bg-surface text-sm"
        >
          <option value="">
            Todas las iglesias de mi alcance{{
              asamblea()?.tipo === 'DISTRITAL' ? ' en el distrito' : ''
            }}
          </option>
          @for (i of iglesiasOpciones(); track i.id) {
            <option [value]="i.id">{{ i.nombre }}</option>
          }
        </select>
        <label class="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" [(ngModel)]="soloBautizados" /> Solo miembros bautizados
        </label>
        <div class="flex justify-end gap-3">
          <app-button variant="ghost" (clicked)="modalImportar.set(false)">Cancelar</app-button>
          <app-button (clicked)="importar()" [disabled]="importando()">{{
            importando() ? 'Importando…' : 'Importar'
          }}</app-button>
        </div>
      </div>
    </app-modal>
  `,
})
export class PadronComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AsambleasService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly limit = 50;
  readonly hora = formatearHora;
  asamblea = signal<AsambleaDetalle | null>(null);
  electores = signal<ElectorPadron[]>([]);
  total = signal(0);
  page = signal(1);
  q = '';
  error = signal('');
  mensaje = signal('');
  modalAcreditar = signal(false);
  modalImportar = signal(false);
  importando = signal(false);
  iglesiaImportar = '';
  soloBautizados = true;

  // Vista del panel: al obispo distrital solo le llegan las iglesias de su distrito.
  private readonly iglesias = toSignal(
    inject(IglesiasService)
      .getAll({ limit: 100, panel: true })
      .pipe(map((r) => r.data)),
    { initialValue: [] },
  );
  iglesiasOpciones = computed(() => {
    const a = this.asamblea();
    return a?.tipo === 'DISTRITAL'
      ? this.iglesias().filter((i) => i.distritoId === a.distritoId)
      : this.iglesias();
  });

  ngOnInit(): void {
    this.service.getById(this.id).subscribe((a) => {
      this.asamblea.set(a);
      this.breadcrumb.set([
        { label: 'Admin', route: '/admin/dashboard' },
        { label: 'Asambleas', route: '/admin/asambleas' },
        { label: a.nombre, route: `/admin/asambleas/${a.id}` },
        { label: 'Padrón' },
      ]);
    });
    this.cargar();
  }

  cargar(): void {
    this.service.getElectores(this.id, this.q, this.page(), this.limit).subscribe({
      next: (r) => {
        this.electores.set(r.data);
        this.total.set(r.total);
      },
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }

  buscar(): void {
    this.page.set(1);
    this.cargar();
  }

  irA(p: number): void {
    this.page.set(p);
    this.cargar();
  }

  quitar(e: ElectorPadron): void {
    if (!confirm(`¿Quitar a ${e.nombre} del padrón?`)) return;
    this.service.eliminarElector(this.id, e.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }

  importar(): void {
    const a = this.asamblea();
    this.importando.set(true);
    this.error.set('');
    this.service
      .importarPadron(this.id, {
        iglesiaId: this.iglesiaImportar ? Number(this.iglesiaImportar) : undefined,
        distritoId:
          !this.iglesiaImportar && a?.tipo === 'DISTRITAL'
            ? (a.distritoId ?? undefined)
            : undefined,
        soloBautizados: this.soloBautizados,
      })
      .subscribe({
        next: (r) => {
          this.importando.set(false);
          this.modalImportar.set(false);
          this.mensaje.set(
            `Se agregaron ${r.agregados} de ${r.encontrados} congregantes encontrados.`,
          );
          this.cargar();
        },
        error: (err) => {
          this.importando.set(false);
          this.error.set(extractErrorMessage(err));
        },
      });
  }
}
