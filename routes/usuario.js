import express from 'express'
import UsuarioController from '../controllers/UsuarioController.js'

const router = express.Router()

router.post('/usuarios', UsuarioController.cadastrar)
router.get('/usuarios', UsuarioController.listar)

export default router