import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

interface AgendamentoDia {
  id: number;
  data: string;
  horario: string;
  cliente: string;
  cliente_apelido: string;
  servico: string;
  cliente_id: number;
}

@Component({
  selector: 'app-home-barbeiro',
  templateUrl: './home-barbeiro.page.html',
  styleUrls: ['./home-barbeiro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class HomeBarbeiroPage implements OnInit {

  nomeBarbeiro: string = '';
  proximosAgendamentos: AgendamentoDia[] = [];

  constructor(
    private router: Router,
    private api: ApiService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
  // Carrega nome do barbeiro do localStorage
  const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);
      this.nomeBarbeiro = usuario.apelido || usuario.nome || '';
    }
  
    // Busca os 3 próximos agendamentos
    this.api.listarProximosAgendamentos().subscribe({
      next: (agendamentos) => {
        this.proximosAgendamentos = agendamentos.map((ag: any) => ({
          id: ag.id,
          data: this.formatarData(ag.data),
          horario: ag.horario.slice(0, 5),
          cliente: ag.cliente_apelido || ag.cliente,
          cliente_apelido: ag.cliente_apelido,
          servico: ag.servico,
          cliente_id: ag.cliente_id,
        }));
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos:', err);
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

  async abrirOpcoes(ag: AgendamentoDia) {
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

  marcarConcluido(ag: AgendamentoDia) {
    this.api.marcarConcluido(ag.id).subscribe({
      next: () => {
        this.proximosAgendamentos = this.proximosAgendamentos.filter(a => a.id !== ag.id);      },
      error: (err) => {
        console.error('Erro ao marcar como concluído:', err);
      }
    });
  }
  
  marcarNaoCompareceu(ag: AgendamentoDia) {
    this.api.marcarNaoCompareceu(ag.id).subscribe({
      next: () => {
        this.proximosAgendamentos = this.proximosAgendamentos.filter(a => a.id !== ag.id);
      },
      error: (err) => {
        console.error('Erro ao marcar não compareceu:', err);
      }
    });
  }

  async cancelarAgendamento(ag: AgendamentoDia) {
    const alert = await this.alertController.create({
      header: 'Cancelar Agendamento',
      message: `Cancelar o agendamento de ${ag.cliente} (${ag.servico}) às ${ag.horario}?\n\nDigite o motivo do cancelamento para enviar ao cliente:`,
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
                this.proximosAgendamentos = this.proximosAgendamentos.filter(a => a.id !== ag.id);
              }
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async abrirSuspensao(ag: AgendamentoDia) {
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

  irAgendamentos() {
    this.router.navigate(['/agendamentos-barbeiro']);
  }

  irAgendarCliente() {
    this.router.navigate(['/agendar-cliente']);
  }

  irBloquearHorarios() {
    this.router.navigate(['/bloquear-horarios']);
  }

  irGerenciarClientes() {
    this.router.navigate(['/gerenciar-clientes']);
  }

  irHistorico() {
    this.router.navigate(['/historico-barbeiro']);
  }
  
  async sair() {
    const alert = await this.alertController.create({
      header: 'Sair',
      message: 'Deseja realmente sair do app?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sair',
          role: 'destructive',
          handler: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            this.router.navigate(['/login']);
          },
        },
      ],
    });
    await alert.present();
  }
}