import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api';

interface Cliente {
  id: number;
  nome: string;
  apelido: string;
  email: string;
  telefone: string;
  foto: string | null;
  suspenso: boolean;
  suspensao_fim: string | null;
}

@Component({
  selector: 'app-perfil-cliente-visualizado',
  templateUrl: './perfil-cliente-visualizado.page.html',
  styleUrls: ['./perfil-cliente-visualizado.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class PerfilClienteVisualizadoPage implements OnInit {

  cliente: Cliente | null = null;
  erro: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.erro = 'Cliente não identificado.';
      return;
    }
  
    this.api.verCliente(Number(id)).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
      },
      error: (err) => {
        this.erro = err.error?.erro || 'Erro ao carregar dados do cliente.';
      }
    });
  }

fotoDoCliente(): string {
  return this.cliente?.foto ? `http://localhost:3000${this.cliente.foto}` : 'assets/perfil-padrao.png';
}

  formatarSuspensao(): string {
    if (!this.cliente?.suspenso) return 'Ativo';
    if (!this.cliente.suspensao_fim) return 'Suspenso (indeterminado)';

    const fim = new Date(this.cliente.suspensao_fim);
    return `Suspenso até ${fim.toLocaleDateString('pt-BR')}`;
  }

  voltar() {
    this.router.navigate(['/home-barbeiro']);
  }
}