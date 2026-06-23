import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class CadastroPage {

  nome: string = '';
  apelido: string = '';
  email: string = '';
  senha: string = '';
  confirmarSenha: string = '';
  telefone: string = '';

  constructor(
    private router: Router,
    private api: ApiService,
    private alertController: AlertController
  ) {}

  async cadastrar() {
    // Validações
    if (!this.nome || !this.email || !this.senha || !this.confirmarSenha) {
      await this.mostrarErro('Preencha todos os campos obrigatórios.');
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    if (!emailValido) {
      await this.mostrarErro('Digite um email válido.');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      await this.mostrarErro('As senhas não coincidem.');
      return;
    }

    const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(this.senha);
      if (!senhaForte) {
        await this.mostrarErro('A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula e número.');
        return;
      }

    const dados = {
      nome: this.nome,
      apelido: this.apelido,
      email: this.email,
      senha: this.senha,
      telefone: this.telefone,
    };

    this.api.cadastrar(dados).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Sucesso!',
          message: 'Cadastro realizado com sucesso! Faça login para continuar.',
          buttons: [{
            text: 'OK',
            handler: () => {
              this.router.navigate(['/login']);
            }
          }],
        });
        await alert.present();
      },
      error: async (err) => {
        const mensagem = err.error?.erro || 'Erro ao realizar cadastro.';
        await this.mostrarErro(mensagem);
      }
    });
  }

  formatarTelefone(event: any) {
    let valor = event.detail.value || '';
    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 11);
    
    if (valor.length > 10) {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (valor.length > 6) {
      valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else if (valor.length > 0) {
      valor = valor.replace(/^(\d{0,2})/, '($1');
    }
  
    this.telefone = valor;
  }

  voltar() {
    this.router.navigate(['/login']);
  }

  async mostrarErro(mensagem: string) {
    const alert = await this.alertController.create({
      header: 'Atenção',
      message: mensagem,
      buttons: ['OK'],
    });
    await alert.present();
  }
}