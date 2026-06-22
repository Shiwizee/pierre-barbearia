# Pierre Barbeiro — App de Agendamento

App mobile de agendamento para barbearia desenvolvido como Trabalho de Conclusão de Curso (TCC) de ensino técnico.

---

## 📋 Sobre o Projeto

O **Pierre Barbeiro** é um aplicativo mobile que permite aos clientes realizarem agendamentos de forma remota, eliminando a necessidade de agendamentos manuais. O sistema conta com dois tipos de usuários: **cliente** e **barbeiro**, cada um com funcionalidades específicas e telas próprias.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- [Ionic](https://ionicframework.com/) — Framework mobile
- [Angular](https://angular.io/) — Framework web
- TypeScript

### Backend
- [Node.js](https://nodejs.org/) — Ambiente de execução
- [Express](https://expressjs.com/) — Framework da API
- [MySQL2](https://www.npmjs.com/package/mysql2) — Conexão com banco de dados
- [BCryptJS](https://www.npmjs.com/package/bcryptjs) — Criptografia de senhas
- [JSON Web Token](https://www.npmjs.com/package/jsonwebtoken) — Autenticação
- [Multer](https://www.npmjs.com/package/multer) — Upload de arquivos (fotos de perfil)
- [node-cron](https://www.npmjs.com/package/node-cron) — Tarefas automáticas agendadas
- [Dotenv](https://www.npmjs.com/package/dotenv) — Variáveis de ambiente
- [CORS](https://www.npmjs.com/package/cors) — Controle de acesso

### Banco de Dados
- MySQL (via XAMPP)

---

## 📁 Estrutura do Projeto

```
pierre-barbearia/
  ├── pierre-app/        → Projeto Ionic (frontend)
  ├── pierre-api/        → API Node.js (backend)
  ├── reset_banco.sql    → Script para recriar o banco do zero
  └── README.md
```

---

## ⚙️ Pré-requisitos

Antes de começar, instale:

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Ionic CLI](https://ionicframework.com/docs/cli) — `npm install -g @ionic/cli`
- [XAMPP](https://www.apachefriends.org/) — para o MySQL
- [MySQL Workbench](https://www.mysql.com/products/workbench/) — para gerenciar o banco

---

## 🚀 Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/pierre-barbearia.git
```

### 2. Configurar a API

```bash
cd pierre-barbearia/pierre-api
npm install
```

Crie o arquivo `.env` na raiz da pasta `pierre-api`:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pierre_barbearia
JWT_SECRET=pierre_barbearia_secret_key_2024
```

> ⚠️ Se o seu MySQL tiver senha, preencha o campo `DB_PASSWORD`.

### 3. Configurar o Banco de Dados

Abra o **MySQL Workbench**, conecte na instância local, abra o arquivo `reset_banco.sql` (na raiz do repositório) e execute todo o script.

Esse script já cria:
- O banco `pierre_barbearia` e todas as tabelas
- O usuário barbeiro (ID 1)
- Os 8 serviços padrão da barbearia

**Login do barbeiro após rodar o script:**
- Email: `pierrebarbeiro@gmail.com`
- Senha: `Pierre@2026`

> 💡 Esse mesmo script pode ser usado a qualquer momento para resetar o banco e voltar ao estado inicial (útil antes de apresentações ou testes).

### 4. Configurar o App Ionic

```bash
cd ../pierre-app
npm install
```

---

## ▶️ Executando o Projeto

### Passo 1 — Inicie o MySQL no XAMPP

Abra o XAMPP e ligue o **MySQL** (o Apache não é necessário, pois a API roda em Node.js).

### Passo 2 — Inicie a API

```bash
cd pierre-api
npm run dev
```

A API estará rodando em `http://localhost:3000`.

### Passo 3 — Inicie o App

```bash
cd pierre-app
ionic serve
```

O app estará disponível em `http://localhost:8100`.

---

## 👤 Funcionalidades

### Cliente
- Cadastro com validação de email, senha forte e máscara de telefone
- Login com autenticação JWT
- Edição de perfil, incluindo apelido e **upload de foto de perfil**
- Agendamento de serviços com seleção de dia e horário (respeitando disponibilidade real)
- Visualização do próximo agendamento na Home
- Cancelamento de agendamentos com motivo obrigatório
- Limite de 2 agendamentos simultâneos
- Histórico completo de agendamentos passados, com motivo de cancelamento visível
- Notificação automática ao logar quando o barbeiro cancela um agendamento

### Barbeiro
- Login com redirecionamento automático para área exclusiva
- Visualização dos 3 próximos agendamentos na Home
- Agendamento manual para clientes, com busca por apelido ou ID
- Bloqueio de horários específicos (com indicação visual de disponível, bloqueado e agendado)
- Visualização e gerenciamento de todos os agendamentos por dia
- Ações rápidas: marcar como concluído, marcar como não compareceu, cancelar (com motivo) ou suspender o cliente
- Visualização do perfil completo de qualquer cliente (incluindo foto)
- Gerenciamento de clientes com suspensão (1, 7, 30 dias ou indeterminada) e reativação
- Histórico completo de todos os atendimentos, com filtros por status

---

## 📏 Regras de Negócio

- A agenda é liberada **semanalmente**, de terça a sábado, automaticamente
- Cancelamentos pelo cliente devem ser feitos com pelo menos **4 horas de antecedência** — os horários exibidos no agendamento já respeitam essa regra
- Cada cliente pode ter no máximo **2 agendamentos simultâneos**
- Agendamentos não finalizados pelo barbeiro **expiram automaticamente** 4 horas após o horário marcado, sendo movidos para "concluído"
- O barbeiro pode suspender clientes por **1 dia, 7 dias, 30 dias ou tempo indeterminado**
- Suspensões com prazo definido são **removidas automaticamente** ao expirar
- Clientes suspensos não conseguem fazer login até o término da suspensão
- Senhas devem ter no mínimo 8 caracteres, com letra maiúscula, minúscula e número

---

## 🗄️ Resetando o Banco de Dados

Para apagar todos os dados e voltar ao estado inicial (útil para testes ou antes de apresentações), execute o arquivo `reset_banco.sql` no MySQL Workbench. Ele recria o banco do zero, já populado com o barbeiro e os serviços padrão.

---

## 📌 Observações

- O arquivo `.env` não é versionado por segurança — crie manualmente em cada máquina
- As fotos de perfil enviadas pelos usuários (`pierre-api/uploads/perfis`) também não são versionadas
- O projeto foi desenvolvido para fins acadêmicos (TCC de ensino técnico)
- A API roda localmente — para uso em produção, seria necessário hospedagem em servidor e ajuste das URLs fixas (atualmente `http://localhost:3000`)

---

## 🔮 Possíveis Melhorias Futuras

- Geração de APK via Capacitor para instalação direta no Android
- Painel de relatórios financeiros para o barbeiro
- Suporte a múltiplos barbeiros simultâneos
- Notificações push (além do alerta dentro do app)

---

## 👨‍💻 Desenvolvido por

Guilherme — Ensino Técnico em Desenvolvimento de Sistemas