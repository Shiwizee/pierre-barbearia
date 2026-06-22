import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

interface Agendamento {
  id: number;
  servico: string;
  preco: string;
  data: string;
  horario: string;
  status: string;
  barbeiro: string;
}

@Component({
  selector: 'app-meus-agendamentos',
  templateUrl: './meus-agendamentos.page.html',
  styleUrls: ['./meus-agendamentos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class MeusAgendamentosPage implements OnInit {

  agendamentos: Agendamento[] = [];

  constructor(
    private router: Router,
    private api: ApiService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.carregarAgendamentos();
  }

  ionViewWillEnter() {
    this.carregarAgendamentos();
  }

  carregarAgendamentos() {
    this.api.listarMeusAgendamentos().subscribe({
      next: (agendamentos) => {
        this.agendamentos = agendamentos.filter((ag: any) =>
          ag.status === 'pendente' || ag.status === 'confirmado'
        );
      }
    });
  }

  formatarData(data: string): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  }

  formatarHorario(horario: string): string {
    return horario.slice(0, 5);
  }

  formatarStatus(status: string): string {
    const map: any = {
      'pendente': 'Agendado',
      'confirmado': 'Agendado',
    };
    return map[status] || status;
  }

  async cancelarAgendamento(ag: Agendamento) {
    const alert = await this.alertController.create({
      header: 'Cancelar Agendamento',
      message: `Deseja cancelar o agendamento de ${ag.servico} em ${this.formatarData(ag.data)} às ${this.formatarHorario(ag.horario)}?`,
      inputs: [
        {
          name: 'motivo',
          type: 'textarea',
          placeholder: 'Digite o motivo do cancelamento (obrigatório)',
        },
      ],
      buttons: [
        { text: 'Voltar', role: 'cancel' },
        {
          text: 'Confirmar Cancelamento',
          role: 'destructive',
          handler: (data) => {
            if (!data.motivo || data.motivo.trim() === '') {
              this.mostrarErroMotivo();
              return false; // impede o alerta de fechar
            }

            this.api.cancelarAgendamento(ag.id, data.motivo).subscribe({
              next: () => {
                this.agendamentos = this.agendamentos.filter(a => a.id !== ag.id);
              },
              error: async (err) => {
                const mensagem = err.error?.erro || 'Erro ao cancelar agendamento.';
                const alertErro = await this.alertController.create({
                  header: 'Atenção',
                  message: mensagem,
                  buttons: ['OK'],
                });
                await alertErro.present();
              }
            });

            return true;
          },
        },
      ],
    });

    await alert.present();
  }
  
  async mostrarErroMotivo() {
    const alert = await this.alertController.create({
      header: 'Atenção',
      message: 'Por favor, informe o motivo do cancelamento.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  novoAgendamento() {
    if (this.agendamentos.length >= 2) return;
    this.router.navigate(['/agendamento']);
  }

  voltar() {
    this.router.navigate(['/home-cliente']);
  }
}