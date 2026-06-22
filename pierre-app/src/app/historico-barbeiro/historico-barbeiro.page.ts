import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

interface ItemHistorico {
  id: number;
  data: string;
  horario: string;
  servico: string;
  cliente: string;
  cliente_apelido: string;
  status: string;
  motivo_cancelamento: string | null;
  agendado_por: string;
}

@Component({
  selector: 'app-historico-barbeiro',
  templateUrl: './historico-barbeiro.page.html',
  styleUrls: ['./historico-barbeiro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class HistoricoBarbeiroPage implements OnInit {

  historico: ItemHistorico[] = [];
  filtroAtivo: string = 'todos';
  expandidoId: number | null = null;

  constructor(
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.carregarHistorico();
  }

  carregarHistorico() {
    this.api.historicoBarbeiro(this.filtroAtivo).subscribe({
      next: (historico) => {
        this.historico = historico;
      },
      error: (err) => {
        console.error('Erro ao carregar histórico:', err);
      }
    });
  }

  filtrar(status: string) {
    this.filtroAtivo = status;
    this.expandidoId = null;
    this.carregarHistorico();
  }

  toggleExpandido(item: ItemHistorico) {
    if (!item.motivo_cancelamento) return;
    this.expandidoId = this.expandidoId === item.id ? null : item.id;
  }

  formatarData(data: string): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatarHorario(horario: string): string {
    return horario.slice(0, 5);
  }

  formatarStatus(status: string): string {
    const map: any = {
      'concluido': 'Concluído',
      'nao_compareceu': 'Não Compareceu',
      'cancelado_cliente': 'Cancel. Cliente',
      'cancelado_barbeiro': 'Cancel. Você',
    };
    return map[status] || status;
  }

  classeStatus(status: string): string {
    if (status === 'concluido') return 'status-concluido';
    if (status === 'nao_compareceu') return 'status-faltou';
    return 'status-cancelado';
  }

  voltar() {
    this.router.navigate(['/home-barbeiro']);
  }
}