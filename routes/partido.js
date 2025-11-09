import express from "express";
import PartidoController from "../controllers/PartidoController.js";
import { ensureAuthenticated, checkRole } from "../config/autenticacao.js"; // caminho corrigido

const router = express.Router();

// Listar (usuário logado pode ver)
router.get("/partidos", ensureAuthenticated, PartidoController.listar);

// Ações restritas ao admin (tipo = 2)
router.post("/partidos", ensureAuthenticated, checkRole(2), PartidoController.cadastrar);
router.put("/partidos/:id", ensureAuthenticated, checkRole(2), PartidoController.editar);
router.delete("/partidos/:id", ensureAuthenticated, checkRole(2), PartidoController.excluir);

export default router;
