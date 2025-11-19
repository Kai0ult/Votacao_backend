import bcrypt from 'bcryptjs'
import db from '../models/index.js'
import passport from "passport";
import { validaCpf, validaEmail, validaSenha } from '../utils/validators.js';
const { Usuario } = db

class UsuarioController {
    // Cadastrar
    cadastrar = async (req, res) => {
        try {
            const { nome, email, senha, cpf, tipo, partido_id } = req.body

            const userExistente = await Usuario.findOne({ where: { email } })
            if (userExistente) {
                return res.status(400).json({ mensagem: 'Usuário já cadastrado!' })
            }

            const validacaoEmail = validaEmail(email)
            if (!validacaoEmail.eValido){
                return res.status(400).json({ mensagem: validacaoEmail.erros[0] });
            }

            const validacaoCPF = validaCpf(cpf)
            if (!validacaoCPF.eValido){
                return res.status(400).json({ mensagem: validacaoCPF.erros[0] });
            }

            const validacaoSenha = validaSenha(senha);
            if (!validacaoSenha.eValido) {
                return res.status(400).json({ 
                    mensagem: 'A senha não atende aos requisitos.', 
                    erros: validacaoSenha.erros 
                });
            }

            const senhaCriptografada = await bcrypt.hash(senha, 10)

            const partidoExistente = await db.Partido.findByPk(partido_id)
            if (!partidoExistente) {
                Usuario.create({
                nome,
                email,
                senha: senhaCriptografada,
                cpf,
                tipo: 2,
                partido_id: null
            })
            }

            const novoUsuario = await Usuario.create({
                nome,
                email,
                senha: senhaCriptografada,
                cpf,
                tipo,
                partido_id
            })

            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario: novoUsuario })
        } catch (erro) {
            console.error('Erro ao cadastrar usuário:', erro)
            res.status(500).json({ mensagem: 'Erro interno ao cadastrar usuário', erro: erro.message })
        }
    }

    login = (req, res, next) => {
        passport.authenticate("usuario-local", (err, usuario, info) => {
            if (err) return res.status(500).json({ mensagem: "Erro interno", erro: err })
            if (!usuario)
                return res.status(401).json({ mensagem: info?.message || "Credenciais inválidas" })

            req.logIn(usuario, (erro) => {
                if (erro) return res.status(500).json({ mensagem: "Erro ao criar sessão" })
                return res.json({
                    mensagem: "Login realizado com sucesso!",
                    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
                })
            })
        })(req, res, next)
    }

    // Retorna usuário logado
    me = (req, res) => {
        if (!req.isAuthenticated())
            return res.status(401).json({ mensagem: "Não autenticado" })
        return res.json(req.user)
    }

    // Logout
    logout = (req, res) => {
        req.logout((err) => {
            if (err) return res.status(500).json({ mensagem: "Erro ao sair" })
            req.session.destroy(() => {
                res.clearCookie("connect.sid")
                res.json({ mensagem: "Logout realizado com sucesso" })
            })
        })
    }

    // Listar
    listar = async (req, res) => {
        try {
            const usuarios = await Usuario.findAll()
            res.status(200).json(usuarios)
        } catch (erro) {
            console.error('Erro ao listar usuários:', erro)
            res.status(500).json({ mensagem: 'Erro interno ao listar usuários', erro: erro.message })
        }
    }

    // Editar
    editar = async (req, res) => {
        try {
            const { id } = req.params
            const { nome, email, senha, cpf, tipo, partido_id } = req.body

            const usuario = await Usuario.findByPk(id)
            if (!usuario) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado!' })
            }


            if (email && email !== usuario.email) {
                const userExistente = await Usuario.findOne({ where: { email } })
                if (userExistente) {
                    return res.status(400).json({ mensagem: 'Email já cadastrado em outro usuário!' })
                }
            }


            if (partido_id && partido_id !== usuario.partido_id) {
                const partidoExistente = await db.Partido.findByPk(partido_id)
                if (!partidoExistente) {
                    return res.status(400).json({ mensagem: 'Partido informado não existe!' })
                }
            }

            const dadosAtualizacao = { nome, email, cpf, tipo, partido_id }

            // Se uma nova senha foi fornecida, criptografar
            if (senha) {
                dadosAtualizacao.senha = await bcrypt.hash(senha, 10)
            }

            await usuario.update(dadosAtualizacao)
            res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!', usuario })
        } catch (erro) {
            console.error('Erro ao editar usuário:', erro)
            res.status(500).json({ mensagem: 'Erro interno ao editar usuário', erro: erro.message })
        }
    }

    // Excluir
    excluir = async (req, res) => {
        try {
            const { id } = req.params

            const usuario = await Usuario.findByPk(id)
            if (!usuario) {
                return res.status(404).json({ mensagem: 'Usuário não encontrado!' })
            }

            await usuario.destroy()
            res.status(200).json({ mensagem: 'Usuário excluído com sucesso!' })
        } catch (erro) {
            console.error('Erro ao excluir usuário:', erro)
            res.status(500).json({ mensagem: 'Erro interno ao excluir usuário', erro: erro.message })
        }
    }
}

export default new UsuarioController()