const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// CADASTRO
const cadastrar = async (req, res) => {
  const { nome, apelido, email, senha, telefone } = req.body;

  try {
    // Verifica se o email já existe
    const [emailExiste] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (emailExiste.length > 0) {
      return res.status(400).json({ erro: 'Email já cadastrado.' });
    }

    // Se não informou apelido, gera um único automaticamente
    let apelidoFinal;
      
    if (apelido && apelido.trim() !== '') {
      apelidoFinal = apelido.trim();
    } else {
      const primeiroNome = nome.trim().split(' ')[0].toLowerCase();
      let gerado = false;
    
      while (!gerado) {
        const numero = Math.floor(Math.random() * 9000) + 1000; // número de 4 dígitos
        const candidato = `${primeiroNome}_${numero}`;
      
        const [existe] = await db.query(
          'SELECT id FROM usuarios WHERE apelido = ?',
          [candidato]
        );
      
        if (existe.length === 0) {
          apelidoFinal = candidato;
          gerado = true;
        }
      }
    }
    
    // Verifica se o apelido escolhido pelo usuário já existe
    if (apelido && apelido.trim() !== '') {
      const [apelidoExiste] = await db.query(
        'SELECT id FROM usuarios WHERE apelido = ?',
        [apelidoFinal]
      );
    
      if (apelidoExiste.length > 0) {
        return res.status(400).json({ erro: 'Apelido já em uso. Escolha outro ou deixe em branco.' });
      }
    }
    
    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Insere o usuário no banco
    await db.query(
      'INSERT INTO usuarios (nome, apelido, email, senha, telefone, tipo) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, apelidoFinal, email, senhaCriptografada, telefone, 'cliente']
    );

    return res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!' });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

// LOGIN
const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Busca o usuário pelo email
    const [usuarios] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    const usuario = usuarios[0];

    // Verifica se a senha está correta
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    // Verifica se o usuário está suspenso
    const [suspensoes] = await db.query(
      `SELECT * FROM suspensoes 
       WHERE cliente_id = ? 
       AND ativa = TRUE 
       AND (fim IS NULL OR fim > NOW())`,
      [usuario.id]
    );

    if (suspensoes.length > 0) {
      const suspensao = suspensoes[0];
      const mensagemFim = suspensao.fim
        ? `até ${new Date(suspensao.fim).toLocaleDateString('pt-BR')}`
        : 'por tempo indeterminado';

      return res.status(403).json({
        erro: `Sua conta está suspensa ${mensagemFim}.`,
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        apelido: usuario.apelido,
        email: usuario.email,
        telefone: usuario.telefone,
        foto: usuario.foto,
        tipo: usuario.tipo,
      },
    });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
};

module.exports = { cadastrar, login };