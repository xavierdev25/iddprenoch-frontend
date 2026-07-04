import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { PublicShellComponent } from './layout/public/public-shell/public-shell.component';

import { HomeComponent } from './features/public/home/home.component';
import { DirectivaComponent } from './features/public/quienes-somos/directiva/directiva.component';
import { MisionVisionComponent } from './features/public/quienes-somos/mision-vision/mision-vision.component';
import { HistoriaComponent } from './features/public/quienes-somos/historia/historia.component';
import { PrincipiosDoctrinalesComponent } from './features/public/quienes-somos/principios-doctrinales/principios-doctrinales.component';
import { QueCreeemosComponent } from './features/public/quienes-somos/que-creemos/que-creemos.component';
import { MinisterioComponent } from './features/public/liderazgo/ministerio/ministerio.component';
import { PlanEstrategicoComponent } from './features/public/recursos/plan-estrategico/plan-estrategico.component';
import { PlanOperativoComponent } from './features/public/recursos/plan-operativo/plan-operativo.component';
import { AccesosAdicionalesComponent } from './features/public/recursos/accesos-adicionales/accesos-adicionales.component';
import { UbicanosComponent } from './features/public/ubicanos/ubicanos.component';

// Todo lo bajo /admin usa loadComponent: son pantallas del panel administrativo, sin valor
// para un visitante del sitio público, así que no deben viajar en el chunk inicial del sitio.
export const routes: Routes = [
  {
    path: '',
    component: PublicShellComponent,
    children: [
      { path: '', component: HomeComponent, title: 'IDDP Región Norte Chico' },
      {
        path: 'quienes-somos',
        children: [
          { path: '', redirectTo: 'directiva', pathMatch: 'full' },
          { path: 'directiva', component: DirectivaComponent, title: 'Directiva — IDDP Norte Chico' },
          { path: 'mision-vision-valores', component: MisionVisionComponent, title: 'Misión, Visión y Valores — IDDP Norte Chico' },
          { path: 'historia', component: HistoriaComponent, title: 'Historia — IDDP Norte Chico' },
          { path: 'principios-doctrinales', component: PrincipiosDoctrinalesComponent, title: 'Principios Doctrinales — IDDP Norte Chico' },
          { path: 'que-creemos', component: QueCreeemosComponent, title: 'Qué Creemos — IDDP Norte Chico' },
        ],
      },
      { path: 'liderazgo/:slug', component: MinisterioComponent, title: 'Ministerio — IDDP Norte Chico' },
      {
        path: 'recursos',
        children: [
          { path: '', redirectTo: 'plan-estrategico', pathMatch: 'full' },
          { path: 'plan-estrategico', component: PlanEstrategicoComponent, title: 'Plan Estratégico — IDDP Norte Chico' },
          { path: 'plan-operativo', component: PlanOperativoComponent, title: 'Plan Operativo — IDDP Norte Chico' },
          { path: 'accesos-adicionales', component: AccesosAdicionalesComponent, title: 'Accesos Adicionales — IDDP Norte Chico' },
        ],
      },
      { path: 'ubicanos', component: UbicanosComponent, title: 'Ubícanos — IDDP Norte Chico' },
    ],
  },
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/admin/auth/login/login.component').then((m) => m.LoginComponent),
        title: 'Iniciar sesión — IDDP Admin',
      },
      {
        path: '',
        loadComponent: () => import('./layout/admin/admin-shell/admin-shell.component').then((m) => m.AdminShellComponent),
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
            title: 'Dashboard — IDDP Admin',
          },
          {
            path: 'distritos',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/admin/distritos/distritos-list/distritos-list.component').then((m) => m.DistritosListComponent),
                title: 'Distritos — IDDP Admin',
              },
              {
                path: 'nuevo',
                loadComponent: () =>
                  import('./features/admin/distritos/distrito-form/distrito-form.component').then((m) => m.DistritoFormComponent),
                title: 'Nuevo Distrito — IDDP Admin',
              },
              {
                path: ':id/editar',
                loadComponent: () =>
                  import('./features/admin/distritos/distrito-form/distrito-form.component').then((m) => m.DistritoFormComponent),
                title: 'Editar Distrito — IDDP Admin',
              },
            ],
          },
          {
            path: 'iglesias',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/admin/iglesias/iglesias-list/iglesias-list.component').then((m) => m.IglesiasListComponent),
                title: 'Iglesias — IDDP Admin',
              },
              {
                path: 'nuevo',
                loadComponent: () =>
                  import('./features/admin/iglesias/iglesia-form/iglesia-form.component').then((m) => m.IglesiaFormComponent),
                title: 'Nueva Iglesia — IDDP Admin',
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/admin/iglesias/iglesia-detail/iglesia-detail.component').then((m) => m.IglesiaDetailComponent),
                title: 'Detalle Iglesia — IDDP Admin',
              },
              {
                path: ':id/editar',
                loadComponent: () =>
                  import('./features/admin/iglesias/iglesia-form/iglesia-form.component').then((m) => m.IglesiaFormComponent),
                title: 'Editar Iglesia — IDDP Admin',
              },
            ],
          },
          {
            path: 'pastores',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/admin/pastores/pastores-list/pastores-list.component').then((m) => m.PastoresListComponent),
                title: 'Pastores — IDDP Admin',
              },
              {
                path: 'nuevo',
                loadComponent: () =>
                  import('./features/admin/pastores/pastor-form/pastor-form.component').then((m) => m.PastorFormComponent),
                title: 'Nuevo Pastor — IDDP Admin',
              },
              {
                path: ':id/editar',
                loadComponent: () =>
                  import('./features/admin/pastores/pastor-form/pastor-form.component').then((m) => m.PastorFormComponent),
                title: 'Editar Pastor — IDDP Admin',
              },
            ],
          },
          {
            path: 'lideres',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/admin/lideres/lideres-list/lideres-list.component').then((m) => m.LideresListComponent),
                title: 'Líderes — IDDP Admin',
              },
              {
                path: 'nuevo',
                loadComponent: () =>
                  import('./features/admin/lideres/lider-form/lider-form.component').then((m) => m.LiderFormComponent),
                title: 'Nuevo Líder — IDDP Admin',
              },
              {
                path: ':id/editar',
                loadComponent: () =>
                  import('./features/admin/lideres/lider-form/lider-form.component').then((m) => m.LiderFormComponent),
                title: 'Editar Líder — IDDP Admin',
              },
            ],
          },
          {
            path: 'congregantes',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/admin/congregantes/congregantes-list/congregantes-list.component').then(
                    (m) => m.CongregantesListComponent,
                  ),
                title: 'Congregantes — IDDP Admin',
              },
              {
                path: 'nuevo',
                loadComponent: () =>
                  import('./features/admin/congregantes/congregante-form/congregante-form.component').then(
                    (m) => m.CongregantesFormComponent,
                  ),
                title: 'Nuevo Congregante — IDDP Admin',
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./features/admin/congregantes/congregante-detail/congregante-detail.component').then(
                    (m) => m.CongregantesDetailComponent,
                  ),
                title: 'Detalle Congregante — IDDP Admin',
              },
              {
                path: ':id/editar',
                loadComponent: () =>
                  import('./features/admin/congregantes/congregante-form/congregante-form.component').then(
                    (m) => m.CongregantesFormComponent,
                  ),
                title: 'Editar Congregante — IDDP Admin',
              },
            ],
          },
          {
            path: 'ministerios',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/admin/ministerios/ministerios-list/ministerios-list.component').then(
                    (m) => m.MinisteriosListComponent,
                  ),
                title: 'Ministerios — IDDP Admin',
              },
              {
                path: 'nuevo',
                loadComponent: () =>
                  import('./features/admin/ministerios/ministerio-form/ministerio-form.component').then((m) => m.MinisterioFormComponent),
                title: 'Nuevo Ministerio — IDDP Admin',
              },
              {
                path: ':id/editar',
                loadComponent: () =>
                  import('./features/admin/ministerios/ministerio-form/ministerio-form.component').then((m) => m.MinisterioFormComponent),
                title: 'Editar Ministerio — IDDP Admin',
              },
            ],
          },
          {
            path: 'eventos',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/admin/eventos/eventos-list/eventos-list.component').then((m) => m.EventosListComponent),
                title: 'Eventos — IDDP Admin',
              },
              {
                path: 'nuevo',
                loadComponent: () =>
                  import('./features/admin/eventos/evento-form/evento-form.component').then((m) => m.EventoFormComponent),
                title: 'Nuevo Evento — IDDP Admin',
              },
              {
                path: ':id/editar',
                loadComponent: () =>
                  import('./features/admin/eventos/evento-form/evento-form.component').then((m) => m.EventoFormComponent),
                title: 'Editar Evento — IDDP Admin',
              },
            ],
          },
          {
            path: 'comunicados',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/admin/comunicados/comunicados-list/comunicados-list.component').then(
                    (m) => m.ComunicadosListComponent,
                  ),
                title: 'Comunicados — IDDP Admin',
              },
              {
                path: 'nuevo',
                loadComponent: () =>
                  import('./features/admin/comunicados/comunicado-form/comunicado-form.component').then((m) => m.ComunicadoFormComponent),
                title: 'Nuevo Comunicado — IDDP Admin',
              },
              {
                path: ':id/editar',
                loadComponent: () =>
                  import('./features/admin/comunicados/comunicado-form/comunicado-form.component').then((m) => m.ComunicadoFormComponent),
                title: 'Editar Comunicado — IDDP Admin',
              },
            ],
          },
          {
            path: 'usuarios',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./features/admin/usuarios/usuarios-list/usuarios-list.component').then((m) => m.UsuariosListComponent),
                title: 'Usuarios — IDDP Admin',
              },
              {
                path: 'nuevo',
                loadComponent: () =>
                  import('./features/admin/usuarios/usuario-form/usuario-form.component').then((m) => m.UsuarioFormComponent),
                title: 'Nuevo Usuario — IDDP Admin',
              },
              {
                path: ':id/editar',
                loadComponent: () =>
                  import('./features/admin/usuarios/usuario-form/usuario-form.component').then((m) => m.UsuarioFormComponent),
                title: 'Editar Usuario — IDDP Admin',
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
