import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class PerfilPage implements OnInit {

  @ViewChild('inputFoto') inputFoto!: ElementRef<HTMLInputElement>;

  nome: string = '';
  apelido: string = '';
  email: string = '';
  telefone: string = '';
  foto: string | null = null;
  fotoExibida: string = 'assets/perfil-padrao.png';
  editando: boolean = false;

  nomeOriginal: string = '';
  apelidoOriginal: string = '';
  emailOriginal: string = '';
  telefoneOriginal: string = '';

  constructor(
    private router: Router,
    private api: ApiService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.carregarPerfil();
  }

  carregarPerfil() {
  // Carrega os dados do localStorage primeiro para exibição rápida
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      const usuario = JSON.parse(usuarioSalvo);
      this.nome = usuario.nome || '';
      this.apelido = usuario.apelido || '';
      this.email = usuario.email || '';
      this.telefone = usuario.telefone || '';
      this.atualizarFotoExibida(usuario.foto);
    }

    // Busca os dados atualizados da API
    this.api.verPerfil().subscribe({
      next: (usuario) => {
        this.nome = usuario.nome;
        this.apelido = usuario.apelido;
        this.email = usuario.email;
        this.telefone = usuario.telefone;
        this.atualizarFotoExibida(usuario.foto);

        // Atualiza o localStorage com os dados mais recentes
        localStorage.setItem('usuario', JSON.stringify(usuario));
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
      }
    });
  }

  atualizarFotoExibida(foto: string | null) {
    this.foto = foto;
    this.fotoExibida = foto ? `http://localhost:3000${foto}` : 'assets/perfil-padrao.png';
  }

  selecionarFoto() {
    this.inputFoto.nativeElement.click();
  }

  async onFotoSelecionada(event: any) {
    const arquivo: File = event.target.files[0];

    if (!arquivo) return;

    // Validação de tamanho (5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
      await this.mostrarErro('A imagem deve ter no máximo 5MB.');
      return;
    }

    this.api.uploadFoto(arquivo).subscribe({
      next: async (resposta) => {
        this.atualizarFotoExibida(resposta.foto);

        // Atualiza o localStorage
        const usuarioSalvo = localStorage.getItem('usuario');
        if (usuarioSalvo) {
          const usuario = JSON.parse(usuarioSalvo);
          usuario.foto = resposta.foto;
          localStorage.setItem('usuario', JSON.stringify(usuario));
        }

        const alert = await this.alertController.create({
          header: 'Sucesso!',
          message: 'Foto de perfil atualizada!',
          buttons: ['OK'],
        });
        await alert.present();
      },
      error: async (err) => {
        const mensagem = err.error?.erro || 'Erro ao enviar a foto.';
        await this.mostrarErro(mensagem);
      }
    });
  }

  async toggleEditar() {
    if (!this.editando) {
      this.nomeOriginal = this.nome;
      this.apelidoOriginal = this.apelido;
      this.emailOriginal = this.email;
      this.telefoneOriginal = this.telefone;
      this.editando = true;
    } else {
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
        if (!emailValido) {
          await this.mostrarErro('Digite um email válido.');
          return;
        }

        const dados: any = {
          nome: this.nome,
          apelido: this.apelido,
          telefone: this.telefone,
        };

      this.api.editarPerfil(dados).subscribe({
        next: async () => {
          // Atualiza o localStorage
          const usuarioSalvo = localStorage.getItem('usuario');
          if (usuarioSalvo) {
            const usuario = JSON.parse(usuarioSalvo);
            usuario.nome = this.nome;
            usuario.apelido = this.apelido;
            usuario.telefone = this.telefone;
            localStorage.setItem('usuario', JSON.stringify(usuario));
          }

          this.editando = false;

          const alert = await this.alertController.create({
            header: 'Sucesso!',
            message: 'Perfil atualizado com sucesso!',
            buttons: ['OK'],
          });
          await alert.present();
        },
        error: async (err) => {
          const mensagem = err.error?.erro || 'Erro ao atualizar perfil.';
          await this.mostrarErro(mensagem);
        }
      });
    }
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

  async mostrarErro(mensagem: string) {
    const alert = await this.alertController.create({
      header: 'Atenção',
      message: mensagem,
      buttons: ['OK'],
    });
    await alert.present();
  }

  formatarTelefoneBlur() {
    if (!this.telefone) return;
    
    let valor = this.telefone.replace(/\D/g, '');
    valor = valor.substring(0, 11);
    
    if (valor.length === 11) {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (valor.length === 10) {
      valor = valor.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
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
    this.router.navigate(['/home-cliente']);
  }
}