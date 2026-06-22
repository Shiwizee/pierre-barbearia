import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

interface Dia {
  nomeDia: string;
  dataFormatada: string;
  dataCompleta: Date;
  dataISO: string;
}

interface AgendamentoBarbeiro {
  id: number;
  horario: string;
  cliente: string;
  cliente_apelido: string;
  cliente_id: number;
  servico: string;
}

@Component({
  selector: 'app-agendamentos-barbeiro',
  templateUrl: './agendamentos-barbeiro.page.html',
  styleUrls: ['./agendamentos-barbeiro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AgendamentosBarbeiroPage implements OnInit {

  diasDisponiveis: Dia[] = [];
  diaSelecionado: Dia | null = null;
  agendamentosFiltrados: AgendamentoBarbeiro[] = [];

  constructor(
    private router: Router,
    private api: ApiService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.gerarDiasDisponiveis();
  }

  gerarDiasDisponiveis() {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const nomeDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diasAtendimento = [2, 3, 4, 5, 6];

    const diffParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diffParaSegunda);

    diasAtendimento.forEach(dia => {
      const data = new Date(segunda);
      data.setDate(segunda.getDate() + (dia - 1));

      if (data >= hoje || data.toDateString() === hoje.toDateString()) {
        this.diasDisponiveis.push({
          nomeDia: nomeDias[dia],
          dataFormatada: `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}`,
          dataISO: `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`,
          dataCompleta: data,
        });
      }
    });
  }

  selecionarDia(dia: Dia) {
    this.diaSelecionado = dia;
    this.carregarAgendamentos(dia.dataISO);
  }

  carregarAgendamentos(dataISO: string) {
    this.api.listarAgendamentosBarbeiro(dataISO).subscribe({
      next: (agendamentos) => {
        this.agendamentosFiltrados = agendamentos.map((ag: any) => ({
          id: ag.id,
          horario: ag.horario.slice(0, 5),
          cliente: ag.cliente_apelido || ag.cliente,
          cliente_apelido: ag.cliente_apelido,
          cliente_id: ag.cliente_id,
          servico: ag.servico,
        }));
      }
    });
  }

  async abrirOpcoes(ag: AgendamentoBarbeiro) {
    const actionSheet = await this.actionSheetController.create({
      header: `${ag.cliente} - ${ag.horario}`,
      buttons: [
        {
          text: 'Ver Perfil do Cliente',
          handler: () => {
            this.router.navigate(['/perfil-cliente-visualizado', ag.cliente_id]);
          },
        },
        {
          text: 'Marcar como Concluído',
          handler: () => {
            this.marcarConcluido(ag);
          },
        },
        {
          text: 'Marcar como Não Compareceu',
          handler: () => {
            this.marcarNaoCompareceu(ag);
          },
        },
        {
          text: 'Cancelar Agendamento',
          role: 'destructive',
          handler: () => {
            this.cancelarAgendamento(ag);
          },
        },
        {
          text: 'Suspender Cliente',
          role: 'destructive',
          handler: () => {
            this.abrirSuspensao(ag);
          },
        },
        {
          text: 'Voltar',
          role: 'cancel',
        },
      ],
    });
  
    await actionSheet.present();
  }
  
  marcarConcluido(ag: AgendamentoBarbeiro) {
    this.api.marcarConcluido(ag.id).subscribe({
      next: () => {
        this.agendamentosFiltrados = this.agendamentosFiltrados.filter(a => a.id !== ag.id);
      },
      error: (err) => {
        console.error('Erro ao marcar como concluído:', err);
      }
    });
  }
  
  marcarNaoCompareceu(ag: AgendamentoBarbeiro) {
    this.api.marcarNaoCompareceu(ag.id).subscribe({
      next: () => {
        this.agendamentosFiltrados = this.agendamentosFiltrados.filter(a => a.id !== ag.id);
      },
      error: (err) => {
        console.error('Erro ao marcar não compareceu:', err);
      }
    });
  }

  async cancelarAgendamento(ag: AgendamentoBarbeiro) {
    const alert = await this.alertController.create({
      header: 'Cancelar Agendamento',
      message: `Cancelar o agendamento de ${ag.cliente} (${ag.servico}) às ${ag.horario}?\n\nDigite o motivo para enviar ao cliente:`,
      inputs: [
        {
          name: 'motivo',
          type: 'textarea',
          placeholder: 'Ex: Imprevisto, será necessário reagendar.',
        },
      ],
      buttons: [
        { text: 'Voltar', role: 'cancel' },
        {
          text: 'Cancelar Agendamento',
          role: 'destructive',
          handler: (data) => {
            this.api.cancelarAgendamentoBarbeiro(ag.id, { motivo: data.motivo }).subscribe({
              next: () => {
                this.agendamentosFiltrados = this.agendamentosFiltrados.filter(a => a.id !== ag.id);
              }
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async abrirSuspensao(ag: AgendamentoBarbeiro) {
    const actionSheet = await this.actionSheetController.create({
      header: `Suspender ${ag.cliente}`,
      buttons: [
        { text: '1 dia', handler: () => this.suspenderCliente(ag.cliente_id, 1) },
        { text: '7 dias', handler: () => this.suspenderCliente(ag.cliente_id, 7) },
        { text: '30 dias', handler: () => this.suspenderCliente(ag.cliente_id, 30) },
        { text: 'Indeterminado', handler: () => this.suspenderCliente(ag.cliente_id, 0) },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });

    await actionSheet.present();
  }

  suspenderCliente(clienteId: number, dias: number) {
    const dados = {
      motivo: 'Suspenso pelo barbeiro.',
      dias: dias === 0 ? null : dias,
    };

    this.api.suspenderCliente(clienteId, dados).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Sucesso!',
          message: 'Cliente suspenso com sucesso!',
          buttons: ['OK'],
        });
        await alert.present();
      }
    });
  }

  voltar() {
    this.router.navigate(['/home-barbeiro']);
  }
}