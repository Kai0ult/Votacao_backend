import bcrypt from 'bcryptjs'
import db from '../models/index.js'
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

            const senhaCriptografada = await bcrypt.hash(senha, 10)

            const partidoExistente = await db.Partido.findByPk(partido_id)
            if (!partidoExistente) {
                return res.status(400).json({ mensagem: 'Partido informado não existe!' })
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

    // Listar
    listar = async (req, res) => {
        try {
            const usuarios = await Usuario.findAll()
            res.status(200).json(usuarios)
        } catch (erro) {
            console.error('Erro ao listar usuários:', erro)
            res.status(500).json({ mensagem: 'Erro interno ao listar usuários', erro: erro.message })
        }
    };

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