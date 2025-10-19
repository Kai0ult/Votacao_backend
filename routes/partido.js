import express from 'express'
import PartidoController from '../controllers/PartidoController.js'

const router = express.Router()

router.post('/partidos', PartidoController.cadastrar)
router.get('/partidos', PartidoController.listar)


export default router