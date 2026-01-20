import express from "express";
import ProjetoController from "../controllers/ProjetoController.js";
import { ensureAuthenticated, checkRole } from "../config/autenticacao.js"; // caminho corrigido

const router = express.Router();

// Listar (usuários logados podem ver)
router.get("/projetos", ensureAuthenticated, ProjetoController.listar);
router.get("/projetos/:id", ensureAuthenticated, ProjetoController.buscarPorId);

// Ações restritas ao admin (tipo = 2)
router.post("/projetos", ensureAuthenticated, checkRole(2), ProjetoController.cadastrar);
router.put("/projetos/:id", ensureAuthenticated, checkRole(2), ProjetoController.editar);
router.delete("/projetos/:id", ensureAuthenticated, checkRole(2), ProjetoController.excluir);
router.get("/projetos/:id/resultado", ensureAuthenticated, ProjetoController.obterResultado);
router.get("/projetos/:id/resultadoPartido", ensureAuthenticated, ProjetoController.obterResultadoPorPartido);
router.get("/projetos/:id/resultadoDetalhado", ensureAuthenticated, ProjetoController.obterResultadoPorVereador);
router.get("/projetos/:id/relatorioPdf", ensureAuthenticated, ProjetoController.downloadRelatorioPDF);
router.get("/projetos/:id/relatorioCsv", ensureAuthenticated, ProjetoController.downloadRelatorioCSV);

export default router;
