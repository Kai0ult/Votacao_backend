import express from 'express'
import UsuarioController from '../controllers/UsuarioController.js'

const router = express.Router()

router.post('/usuarios', UsuarioController.cadastrar)
router.get('/usuarios', UsuarioController.listar)
router.put('/usuarios/:id', UsuarioController.editar)
router.delete('/usuarios/:id', UsuarioController.excluir)
router.post("/login", UsuarioController.login)
router.get("/me", UsuarioController.me)
router.post("/logout", UsuarioController.logout)

export default router