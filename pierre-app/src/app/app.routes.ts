import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage),
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./cadastro/cadastro.page').then( m => m.CadastroPage),
  },
  {
    path: 'home-cliente',
    loadComponent: () => import('./home-cliente/home-cliente.page').then( m => m.HomeClientePage),
  },
  {
    path: 'agendamento',
    loadComponent: () => import('./agendamento/agendamento.page').then( m => m.AgendamentoPage),
  },
  {
    path: 'meus-agendamentos',
    loadComponent: () => import('./meus-agendamentos/meus-agendamentos.page').then( m => m.MeusAgendamentosPage),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./perfil/perfil.page').then( m => m.PerfilPage)
  },
  {
    path: 'home-barbeiro',
    loadComponent: () => import('./home-barbeiro/home-barbeiro.page').then( m => m.HomeBarbeiroPage)
  },
  {
    path: 'agendamentos-barbeiro',
    loadComponent: () => import('./agendamentos-barbeiro/agendamentos-barbeiro.page').then( m => m.AgendamentosBarbeiroPage)
  },
  {
    path: 'agendar-cliente',
    loadComponent: () => import('./agendar-cliente/agendar-cliente.page').then( m => m.AgendarClientePage)
  },
  {
    path: 'bloquear-horarios',
    loadComponent: () => import('./bloquear-horarios/bloquear-horarios.page').then( m => m.BloquearHorariosPage)
  },
  {
    path: 'gerenciar-clientes',
    loadComponent: () => import('./gerenciar-clientes/gerenciar-clientes.page').then( m => m.GerenciarClientesPage)
  },
  {
    path: 'perfil-cliente-visualizado/:id',
    loadComponent: () => import('./perfil-cliente-visualizado/perfil-cliente-visualizado.page').then((m) => m.PerfilClienteVisualizadoPage),
  },
  {
    path: 'historico-cliente',
    loadComponent: () => import('./historico-cliente/historico-cliente.page').then( m => m.HistoricoClientePage)
  },
  {
    path: 'historico-barbeiro',
    loadComponent: () => import('./historico-barbeiro/historico-barbeiro.page').then( m => m.HistoricoBarbeiroPage)
  },
];