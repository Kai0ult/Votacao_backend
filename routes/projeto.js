import express from 'express'
import ProjetoController from '../controllers/ProjetoController.js'

const router = express.Router()

router.post('/projetos', ProjetoController.cadastrar)
router.get('/projetos', ProjetoController.listar)
router.put('/projetos/:id', ProjetoController.editar)
router.delete('/projetos/:id', ProjetoController.excluir)

export default router