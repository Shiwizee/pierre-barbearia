import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

interface Cliente {
  id: number;
  nome: string;
  apelido: string;
}

interface Servico {
  id: number;
  nome: string;
  preco: string;
}

interface Dia {
  nomeDia: string;
  dataFormatada: string;
  dataCompleta: Date;
  dataISO: string;
}

@Component({
  selector: 'app-agendar-cliente',
  templateUrl: './agendar-cliente.page.html',
  styleUrls: ['./agendar-cliente.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AgendarClientePage implements OnInit {

  termoBusca: string = '';
  sugestoes: Cliente[] = [];
  clienteSelecionado: Cliente | null = null;

  servicos: Servico[] = [];
  horarios: string[] = [];
  diasDisponiveis: Dia[] = [];

  servicoSelecionado: Servico | null = null;
  diaSelecionado: Dia | null = null;
  horarioSelecionado: string | null = null;

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

  buscarClientes() {
    const termo = this.termoBusca.toLowerCase().trim();

    if (termo === '') {
      this.sugestoes = [];
      return;
    }

    this.api.listarClientes(termo).subscribe({
      next: (clientes) => {
        this.sugestoes = clientes;
      }
    });
  }

  selecionarCliente(cliente: Cliente) {
    this.clienteSelecionado = cliente;
    this.termoBusca = '';
    this.sugestoes = [];
  }

  removerCliente() {
    this.clienteSelecionado = null;
    this.servicoSelecionado = null;
    this.diaSelecionado = null;
    this.horarioSelecionado = null;
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
    const todosHorarios = [
      '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00',
      '16:00', '17:00', '18:00', '19:00',
      '20:00', '21:00', '22:00', '23:00',
    ];

    this.api.listarDisponibilidade(this.barbeiroId, dia.dataISO).subscribe({
      next: (disponibilidade) => {
        const bloqueados: string[] = disponibilidade.bloqueados.map((h: string) => h.slice(0, 5));
        const agendados: string[] = disponibilidade.agendados.map((h: string) => h.slice(0, 5));
        const indisponiveis = [...bloqueados, ...agendados];

        // Barbeiro não tem restrição de 4 horas
        this.horarios = todosHorarios.filter(hora => !indisponiveis.includes(hora));
      }
    });
  }

  selecionarHorario(hora: string) {
    this.horarioSelecionado = hora;
  }

  async confirmarAgendamento() {
    const alert = await this.alertController.create({
      header: 'Confirmar Agendamento',
      message: `Agendar ${this.servicoSelecionado?.nome} para ${this.clienteSelecionado?.nome} (${this.clienteSelecionado?.apelido}) em ${this.diaSelecionado?.nomeDia} ${this.diaSelecionado?.dataFormatada} às ${this.horarioSelecionado}?`,
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
      cliente_id: this.clienteSelecionado?.id,
      servico_id: this.servicoSelecionado?.id,
      data: this.diaSelecionado?.dataISO,
      horario: this.horarioSelecionado + ':00',
    };

    this.api.criarAgendamentoBarbeiro(dados).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Sucesso!',
          message: 'Agendamento realizado com sucesso!',
          buttons: [{
            text: 'OK',
            handler: () => {
              this.router.navigate(['/home-barbeiro']);
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
    this.router.navigate(['/home-barbeiro']);
  }
}