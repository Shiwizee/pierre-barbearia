import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class LoginPage {

  email: string = '';
  senha: string = '';

  constructor(
    private router: Router,
    private api: ApiService,
    private alertController: AlertController
  ) {}

  entrar() {
    if (!this.email || !this.senha) {
      this.mostrarErro('Preencha todos os campos.');
      return;
    }

    this.api.login({ email: this.email, senha: this.senha }).subscribe({
      next: (resposta) => {
        // Salva o token e os dados do usuário
        localStorage.setItem('token', resposta.token);
        localStorage.setItem('usuario', JSON.stringify(resposta.usuario));

        // Redireciona conforme o tipo de usuário
        if (resposta.usuario.tipo === 'barbeiro') {
          this.router.navigate(['/home-barbeiro']);
        } else {
          this.router.navigate(['/home-cliente']);
        }
      },
      error: (err) => {
        const mensagem = err.error?.erro || 'Erro ao fazer login.';
        this.mostrarErro(mensagem);
      }
    });
  }

  cadastrar() {
    this.router.navigate(['/cadastro']);
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