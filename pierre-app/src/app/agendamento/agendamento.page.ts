import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

interface Servico {
  id: number;
  nome: string;
  preco: string;
}

interface Dia {
  nomeDia: string;
  dataFormatada: string;
  dataCompleta: Date;
  dataISO: string; // formato yyyy-mm-dd para a API
}

@Component({
  selector: 'app-agendamento',
  templateUrl: './agendamento.page.html',
  styleUrls: ['./agendamento.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AgendamentoPage implements OnInit {

  servicos: Servico[] = [];
  horarios: string[] = [];
  diasDisponiveis: Dia[] = [];

  servicoSelecionado: Servico | null = null;
  diaSelecionado: Dia | null = null;
  horarioSelecionado: string | null = null;

  // ID do barbeiro (futuramente pode vir de uma seleção)
  barbeiroId: number = 1;

  constructor(
    private router: Router,
    private api: ApiService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.gerarDiasDisponiveis();
    this.carregarServicos();
  }

  carregarServicos() {
    this.api.listarServicos().subscribe({
      next: (servicos) => {
        this.servicos = servicos;
      }
    });
  }

  gerarDiasDisponiveis() {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const nomeDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diasAtendimento = [2, 3, 4, 5, 6];

    const diffParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + diffParaSegunda);

    const todosHorarios = [
      '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00',
      '16:00', '17:00', '18:00', '19:00',
      '20:00', '21:00', '22:00', '23:00',
    ];

    diasAtendimento.forEach(dia => {
      const data = new Date(segunda);
      data.setDate(segunda.getDate() + (dia - 1));

      const ehHoje = data.toDateString() === hoje.toDateString();

      if (data < hoje && !ehHoje) return;

      if (ehHoje) {
        const temHorarioValido = todosHorarios.some(hora => {
          const [h, m] = hora.split(':').map(Number);
          const horarioDate = new Date();
          horarioDate.setHours(h, m, 0, 0);
          const diffHoras = (horarioDate.getTime() - hoje.getTime()) / (1000 * 60 * 60);
          return diffHoras >= 4;
        });

        if (!temHorarioValido) return;
      }

      this.diasDisponiveis.push({
        nomeDia: nomeDias[dia],
        dataFormatada: `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}`,
        dataISO: `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`,
        dataCompleta: data,
      });
    });
  }

  selecionarServico(servico: Servico) {
    this.servicoSelecionado = servico;
    this.diaSelecionado = null;
    this.horarioSelecionado = null;
  }

  selecionarDia(dia: Dia) {
    this.diaSelecionado = dia;
    this.horarioSelecionado = null;
    this.carregarHorariosDisponiveis(dia);
  }

  carregarHorariosDisponiveis(dia: Dia) {
    const hoje = new Date();
    const ehHoje = dia.dataCompleta.toDateString() === hoje.toDateString();

    const todosHorarios = [
      '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00',
      '16:00', '17:00', '18:00', '19:00',
      '20:00', '21:00', '22:00', '23:00',
    ];

    // Busca horários bloqueados e agendados da API
    this.api.listarDisponibilidade(this.barbeiroId, dia.dataISO).subscribe({
      next: (disponibilidade) => {
        const bloqueados: string[] = disponibilidade.bloqueados.map((h: string) => h.slice(0, 5));
        const agendados: string[] = disponibilidade.agendados.map((h: string) => h.slice(0, 5));
        const indisponiveis = [...bloqueados, ...agendados];

        this.horarios = todosHorarios.filter(hora => {
          // Remove horários indisponíveis
          if (indisponiveis.includes(hora)) return false;

          // Se for hoje, aplica regra das 4 horas
          if (ehHoje) {
            const [h, m] = hora.split(':').map(Number);
            const horarioDate = new Date();
            horarioDate.setHours(h, m, 0, 0);
            const diffHoras = (horarioDate.getTime() - hoje.getTime()) / (1000 * 60 * 60);
            return diffHoras >= 4;
          }

          return true;
        });
      }
    });
  }

  selecionarHorario(hora: string) {
    this.horarioSelecionado = hora;
  }

  async confirmarAgendamento() {
    const alert = await this.alertController.create({
      header: 'Atenção!',
      message: `Ao confirmar, você concorda com as seguintes regras:\n\n⏰ Cancelamentos devem ser feitos com pelo menos 4 horas de antecedência.\n\n⚠️ O descumprimento pode resultar em suspensão temporária.\n\nConfirmar agendamento de ${this.servicoSelecionado?.nome} em ${this.diaSelecionado?.nomeDia} ${this.diaSelecionado?.dataFormatada} às ${this.horarioSelecionado}?`,
      backdropDismiss: false,
      cssClass: 'alert-html',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.realizarAgendamento();
          },
        },
      ],
    });

    await alert.present();
  }

  realizarAgendamento() {
    const dados = {
      barbeiro_id: this.barbeiroId,
      servico_id: this.servicoSelecionado?.id,
      data: this.diaSelecionado?.dataISO,
      horario: this.horarioSelecionado + ':00',
    };

    this.api.criarAgendamento(dados).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Sucesso!',
          message: 'Agendamento realizado com sucesso!',
          buttons: [{
            text: 'OK',
            handler: () => {
              this.router.navigate(['/home-cliente']);
            }
          }],
        });
        await alert.present();
      },
      error: async (err) => {
        const mensagem = err.error?.erro || 'Erro ao realizar agendamento.';
        const alert = await this.alertController.create({
          header: 'Atenção',
          message: mensagem,
          buttons: ['OK'],
        });
        await alert.present();
      }
    });
  }

  voltar() {
    this.router.navigate(['/home-cliente']);
  }
}