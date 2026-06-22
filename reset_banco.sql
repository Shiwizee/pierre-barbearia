-- =========================================================
-- PIERRE BARBEARIA - SCRIPT DE RESET DO BANCO DE DADOS
-- =========================================================
-- Use este script para apagar e recriar o banco do zero,
-- já com o barbeiro (ID 1) e os 8 serviços cadastrados.
--
-- Login do barbeiro após o reset:
--   Email: pierrebarbeiro@gmail.com
--   Senha: Pierre@2026
-- =========================================================

DROP DATABASE IF EXISTS pierre_barbearia;
CREATE DATABASE pierre_barbearia;
USE pierre_barbearia;

-- =========================================================
-- TABELAS
-- =========================================================

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  apelido VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  foto VARCHAR(255) NULL,
  tipo ENUM('cliente', 'barbeiro') NOT NULL DEFAULT 'cliente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suspensoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  barbeiro_id INT NOT NULL,
  motivo TEXT,
  inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fim TIMESTAMP NULL,
  ativa BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  FOREIGN KEY (barbeiro_id) REFERENCES usuarios(id)
);

CREATE TABLE servicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barbeiro_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (barbeiro_id) REFERENCES usuarios(id)
);

CREATE TABLE horarios_bloqueados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barbeiro_id INT NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  FOREIGN KEY (barbeiro_id) REFERENCES usuarios(id)
);

CREATE TABLE agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  barbeiro_id INT NOT NULL,
  servico_id INT NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  status ENUM('pendente', 'confirmado', 'concluido', 'nao_compareceu', 'cancelado_cliente', 'cancelado_barbeiro') DEFAULT 'pendente',
  motivo_cancelamento TEXT NULL,
  agendado_por ENUM('cliente', 'barbeiro') DEFAULT 'cliente',
  notificado BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  FOREIGN KEY (barbeiro_id) REFERENCES usuarios(id),
  FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

-- =========================================================
-- DADOS INICIAIS
-- =========================================================

-- Cria o barbeiro como ID 1 (senha: Pierre@2026)
INSERT INTO usuarios (nome, apelido, email, senha, telefone, tipo)
VALUES ('Pierre', 'Pierre', 'pierrebarbeiro@gmail.com', '$2b$10$VxF7lSAtgGETcD5fNXYr6.zilnnCxPaea3amPE.5ahIgtbnLSkahC', '(11) 99999-9999', 'barbeiro');

-- Cadastra os serviços
INSERT INTO servicos (barbeiro_id, nome, preco) VALUES
(1, 'Corte', 30.00),
(1, 'Barba', 20.00),
(1, 'Pézinho', 10.00),
(1, 'Pigmentação', 30.00),
(1, 'Luzes', 30.00),
(1, 'Corte + Platinado', 80.00),
(1, 'Corte + Colorimetria', 30.00),
(1, 'Limpeza de Pele', 20.00);

-- =========================================================
-- CONFERÊNCIA VISUAL
-- =========================================================

SELECT * FROM usuarios;
SELECT * FROM servicos;
SELECT * FROM agendamentos;
