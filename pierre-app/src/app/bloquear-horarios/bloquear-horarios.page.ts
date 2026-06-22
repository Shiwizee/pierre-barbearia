import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

interface Dia {
  nomeDia: string;
  dataFormatada: string;
  dataCompleta: Date;
  dataISO: string;
}

@Component({
  selector: 'app-bloquear-horarios',
  templateUrl: './bloquear-horarios.page.html',
  styleUrls: ['./bloquear-horarios.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class BloquearHorariosPage implements OnInit {

  diasDisponiveis: Dia[] = [];
  diaSelecionado: Dia | null = null;

  horarios: string[] = [
    '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00', '23:00',
  ];

  horariosBloqueados: string[] = [];
  horariosAgendados: string[] = [];
  horariosSelecionados: string[] = [];

  constructor(
    private router: Router,
    private api: ApiService,
    private alertController: AlertController
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
    this.horariosSelecionados = [];
    this.carregarDisponibilidade(dia.dataISO);
  }

  carregarDisponibilidade(dataISO: string) {
    const barbeiroId = 1; // futuramente vem do localStorage

    this.api.listarDisponibilidade(barbeiroId, dataISO).subscribe({
      next: (disponibilidade) => {
        this.horariosBloqueados = disponibilidade.bloqueados.map((h: string) => h.slice(0, 5));
        this.horariosAgendados = disponibilidade.agendados.map((h: string) => h.slice(0, 5));
      }
    });
  }

  estaBloqueado(hora: string): boolean {
    return this.horariosBloqueados.includes(hora);
  }

  estaAgendado(hora: string): boolean {
    return this.horariosAgendados.includes(hora);
  }

  estaSelecionado(hora: string): boolean {
    return this.horariosSelecionados.includes(hora);
  }

  async toggleHorario(hora: string) {
    if (this.estaAgendado(hora)) {
      const alert = await this.alertController.create({
        header: 'Indisponível',
        message: 'Este horário já possui um agendamento e não pode ser bloqueado.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const index = this.horariosSelecionados.indexOf(hora);
    if (index > -1) {
      this.horariosSelecionados.splice(index, 1);
    } else {
      this.horariosSelecionados.push(hora);
    }
  }

  salvarBloqueios() {
    if (!this.diaSelecionado) return;

    // Monta a lista de alterações
    const horarios = this.horariosSelecionados.map(hora => ({
      horario: hora + ':00',
      bloquear: !this.horariosBloqueados.includes(hora),
    }));

    const dados = {
      data: this.diaSelecionado.dataISO,
      horarios,
    };

    this.api.salvarBloqueios(dados).subscribe({
      next: async () => {
        // Atualiza a lista local
        this.horariosSelecionados.forEach(hora => {
          const index = this.horariosBloqueados.indexOf(hora);
          if (index > -1) {
            this.horariosBloqueados.splice(index, 1);
          } else {
            this.horariosBloqueados.push(hora);
          }
        });

        this.horariosSelecionados = [];

        const alert = await this.alertController.create({
          header: 'Sucesso!',
          message: 'Bloqueios salvos com sucesso!',
          buttons: ['OK'],
        });
        await alert.present();
      },
      error: async (err) => {
        const mensagem = err.error?.erro || 'Erro ao salvar bloqueios.';
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