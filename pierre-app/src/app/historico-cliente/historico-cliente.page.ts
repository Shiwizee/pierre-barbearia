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
  preco: string;
  status: string;
  motivo_cancelamento: string | null;
}

@Component({
  selector: 'app-historico-cliente',
  templateUrl: './historico-cliente.page.html',
  styleUrls: ['./historico-cliente.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class HistoricoClientePage implements OnInit {

  historico: ItemHistorico[] = [];
  expandidoId: number | null = null;

  constructor(
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.carregarHistorico();
  }

  carregarHistorico() {
    this.api.historicoCliente().subscribe({
      next: (historico) => {
        this.historico = historico;
      },
      error: (err) => {
        console.error('Erro ao carregar histórico:', err);
      }
    });
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
      'cancelado_cliente': 'Cancelado por Você',
      'cancelado_barbeiro': 'Cancelado pelo Barbeiro',
    };
    return map[status] || status;
  }
  
  toggleExpandido(item: ItemHistorico) {
    if (!item.motivo_cancelamento) return;
    this.expandidoId = this.expandidoId === item.id ? null : item.id;
  }

  classeStatus(status: string): string {
    if (status === 'concluido') return 'status-concluido';
    if (status === 'nao_compareceu') return 'status-faltou';
    return 'status-cancelado';
  }

  voltar() {
    this.router.navigate(['/perfil']);
  }
}