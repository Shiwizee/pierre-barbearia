import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.page.html',
  styleUrls: ['./home-cliente.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class HomeClientePage implements OnInit {

nomeCliente: string = '';
apelidoCliente: string = '';
proximoAgendamento: string = '';
fotoExibida: string = 'assets/perfil-padrao.png';

  constructor(
    private router: Router,
    private api: ApiService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.carregarDados();
    this.verificarNotificacoes();
  }

  ionViewWillEnter() {
    this.carregarDados();
    this.verificarNotificacoes();
  }

  verificarNotificacoes() {
    this.api.notificacoesPendentes().subscribe({
      next: (notificacoes) => {
        if (notificacoes.length > 0) {
          this.exibirNotificacao(notificacoes[0], notificacoes.length);
        }
      },
      error: (err) => {
        console.error('Erro ao verificar notificações:', err);
      }
    });
  }

  async exibirNotificacao(notificacao: any, total: number) {
    const data = new Date(notificacao.data);
    const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const horario = notificacao.horario.slice(0, 5);

    const mensagemExtra = total > 1 ? `\n\n(Você tem mais ${total - 1} aviso(s) pendente(s))` : '';

    const alert = await this.alertController.create({
      header: 'Agendamento Cancelado',
      message: `Seu agendamento de ${notificacao.servico} em ${dataFormatada} às ${horario} foi cancelado pelo barbeiro.\n\nMotivo: ${notificacao.motivo_cancelamento || 'Não informado'}${mensagemExtra}`,
      cssClass: 'alert-html',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.api.marcarNotificado(notificacao.id).subscribe({
            next: () => {
              // Verifica se há mais notificações pendentes
              this.verificarNotificacoes();
            },
            error: (err) => {
              console.error('Erro ao marcar notificação:', err);
            }
          });
        }
      }],
    });

    await alert.present();
  }

  carregarDados() {
  // Carrega nome do localStorage
  const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);
      this.nomeCliente = usuario.nome || '';
      this.apelidoCliente = usuario.apelido || '';
      this.fotoExibida = usuario.foto ? `http://localhost:3000${usuario.foto}` : 'assets/perfil-padrao.png';
    }

    // Busca agendamentos ativos
    this.api.listarMeusAgendamentos().subscribe({
      next: (agendamentos) => {
        // Filtra apenas agendamentos ativos (não cancelados)
        const ativos = agendamentos.filter((ag: any) =>
          ag.status === 'pendente' || ag.status === 'confirmado'
        );

        if (ativos.length > 0) {
          const proximo = ativos[0];
          const data = new Date(proximo.data);
          const dataFormatada = data.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
          });
          this.proximoAgendamento = `${proximo.servico} — ${dataFormatada} às ${proximo.horario.slice(0, 5)}`;
        } else {
          this.proximoAgendamento = '';
        }
      }
    });
  }

  irHome() {
    this.router.navigate(['/home-cliente']);
  }

  irAgendar() {
    this.router.navigate(['/agendamento']);
  }

  irMeusAgendamentos() {
    this.router.navigate(['/meus-agendamentos']);
  }

  irHistorico() {
    this.router.navigate(['/historico-cliente']);
  }
  
  irCancelar() {
    this.router.navigate(['/cancelar-agendamento']);
  }

  verPerfil() {
    this.router.navigate(['/perfil']);
  }
}