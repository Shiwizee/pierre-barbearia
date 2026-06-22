import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Gera o header com o token JWT
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // =====================
  // AUTH
  // =====================
  cadastrar(dados: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/cadastrar`, dados);
  }

  login(dados: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, dados);
  }

  // =====================
  // USUÁRIOS
  // =====================
  verPerfil(): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios/perfil`, { headers: this.getHeaders() });
  }

  editarPerfil(dados: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/perfil`, dados, { headers: this.getHeaders() });
  }

  uploadFoto(arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('foto', arquivo);
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Não definimos Content-Type aqui — o navegador define automaticamente para FormData
    });
  
    return this.http.post(`${this.baseUrl}/usuarios/perfil/foto`, formData, { headers });
  }

  listarClientes(busca?: string): Observable<any> {
    const params = busca ? `?busca=${busca}` : '';
    return this.http.get(`${this.baseUrl}/usuarios/clientes${params}`, { headers: this.getHeaders() });
  }

  verCliente(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios/cliente/${id}`, { headers: this.getHeaders() });
  }

  suspenderCliente(id: number, dados: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/suspender/${id}`, dados, { headers: this.getHeaders() });
  }

  reativarCliente(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios/reativar/${id}`, {}, { headers: this.getHeaders() });
  }

  // =====================
  // AGENDAMENTOS
  // =====================
  listarMeusAgendamentos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agendamentos/meus`, { headers: this.getHeaders() });
  }

  historicoCliente(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agendamentos/historico`, { headers: this.getHeaders() });
  }

  notificacoesPendentes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agendamentos/notificacoes`, { headers: this.getHeaders() });
  }
  
  marcarNotificado(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/agendamentos/notificacoes/${id}`, {}, { headers: this.getHeaders() });
  }

  historicoBarbeiro(status?: string): Observable<any> {
    const params = status ? `?status=${status}&_t=${Date.now()}` : `?_t=${Date.now()}`;
    return this.http.get(`${this.baseUrl}/agendamentos/barbeiro/historico${params}`, { headers: this.getHeaders() });
  }

  listarAgendamentosBarbeiro(data?: string): Observable<any> {
    const params = data ? `?data=${data}` : '';
    return this.http.get(`${this.baseUrl}/agendamentos/barbeiro${params}`, { headers: this.getHeaders() });
  }

  listarProximosAgendamentos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agendamentos/barbeiro/proximos`, { headers: this.getHeaders() });
  }

  criarAgendamento(dados: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agendamentos`, dados, { headers: this.getHeaders() });
  }

  criarAgendamentoBarbeiro(dados: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agendamentos/barbeiro`, dados, { headers: this.getHeaders() });
  }

  cancelarAgendamento(id: number, motivo?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/agendamentos/cancelar/${id}`, { motivo }, { headers: this.getHeaders() });
  }

  cancelarAgendamentoBarbeiro(id: number, dados: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/agendamentos/barbeiro/cancelar/${id}`, dados, { headers: this.getHeaders() });
  }

  marcarConcluido(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/agendamentos/barbeiro/concluir/${id}`, {}, { headers: this.getHeaders() });
  }

  marcarNaoCompareceu(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/agendamentos/barbeiro/nao-compareceu/${id}`, {}, { headers: this.getHeaders() });
  }

  // =====================
  // SERVIÇOS
  // =====================
  listarServicos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/servicos`, { headers: this.getHeaders() });
  }

  criarServico(dados: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/servicos`, dados, { headers: this.getHeaders() });
  }

  editarServico(id: number, dados: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/servicos/${id}`, dados, { headers: this.getHeaders() });
  }

  desativarServico(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/servicos/desativar/${id}`, {}, { headers: this.getHeaders() });
  }

  // =====================
  // HORÁRIOS
  // =====================
  listarDisponibilidade(barbeiroId: number, data: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/horarios/disponibilidade?barbeiro_id=${barbeiroId}&data=${data}`, { headers: this.getHeaders() });
  }

  salvarBloqueios(dados: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/horarios/bloquear`, dados, { headers: this.getHeaders() });
  }
}