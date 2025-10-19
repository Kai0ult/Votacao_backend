import express from 'express'
import PartidoController from '../controllers/PartidoController.js'

const router = express.Router()

router.post('/partidos', PartidoController.cadastrar)
router.get('/partidos', PartidoController.listar)
router.put('/partidos/:id', PartidoController.editar)
router.delete('/partidos/:id', PartidoController.excluir)

export default router