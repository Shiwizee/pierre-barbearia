import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

interface Cliente {
  id: number;
  nome: string;
  apelido: string;
  email: string;
  telefone: string;
  suspenso: boolean;
  suspensao_fim: string | null;
}

@Component({
  selector: 'app-gerenciar-clientes',
  templateUrl: './gerenciar-clientes.page.html',
  styleUrls: ['./gerenciar-clientes.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class GerenciarClientesPage implements OnInit {

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  termoBusca: string = '';

  constructor(
    private router: Router,
    private api: ApiService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.carregarClientes();
  }

  ionViewWillEnter() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.api.listarClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.clientesFiltrados = clientes;
      }
    });
  }

  filtrarClientes() {
    const termo = this.termoBusca.toLowerCase().trim();

    if (termo === '') {
      this.clientesFiltrados = this.clientes;
      return;
    }

    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.apelido.toLowerCase().includes(termo) ||
      cliente.id.toString().includes(termo)
    );
  }

  formatarSuspensao(cliente: Cliente): string {
    if (!cliente.suspenso) return 'Ativo';
    if (!cliente.suspensao_fim) return 'Suspenso (indeterminado)';

    const fim = new Date(cliente.suspensao_fim);
    return `Suspenso até ${fim.toLocaleDateString('pt-BR')}`;
  }

  async abrirOpcoesSuspensao(cliente: Cliente) {
    if (cliente.suspenso) {
      const alert = await this.alertController.create({
        header: 'Reativar Cliente',
        message: `Deseja reativar ${cliente.apelido}?`,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Reativar',
            handler: () => {
              this.api.reativarCliente(cliente.id).subscribe({
                next: () => {
                  cliente.suspenso = false;
                  cliente.suspensao_fim = null;
                }
              });
            },
          },
        ],
      });
      await alert.present();
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: `Suspender ${cliente.apelido}`,
      buttons: [
        { text: '1 dia', handler: () => this.suspenderCliente(cliente, 1) },
        { text: '7 dias', handler: () => this.suspenderCliente(cliente, 7) },
        { text: '30 dias', handler: () => this.suspenderCliente(cliente, 30) },
        { text: 'Indeterminado', handler: () => this.suspenderCliente(cliente, 0) },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });

    await actionSheet.present();
  }

  suspenderCliente(cliente: Cliente, dias: number) {
    const dados = {
      motivo: 'Suspenso pelo barbeiro.',
      dias: dias === 0 ? null : dias,
    };

    this.api.suspenderCliente(cliente.id, dados).subscribe({
      next: async () => {
        cliente.suspenso = true;

        if (dias === 0) {
          cliente.suspensao_fim = null;
        } else {
          const fim = new Date();
          fim.setDate(fim.getDate() + dias);
          cliente.suspensao_fim = fim.toISOString();
        }

        const alert = await this.alertController.create({
          header: 'Sucesso!',
          message: `${cliente.apelido} suspenso com sucesso!`,
          buttons: ['OK'],
        });
        await alert.present();
      }
    });
  }

  verPerfil(cliente: Cliente) {
    this.router.navigate(['/perfil-cliente-visualizado', cliente.id]);
  }

  voltar() {
    this.router.navigate(['/home-barbeiro']);
  }
}