import express from "express";
import VotacaoController from "../controllers/VotacaoController.js";
import { ensureAuthenticated, checkRole } from "../config/autenticacao.js";

const router = express.Router();

// Listar todos os votos (usuarios logados podem ver)
router.get("/votos", ensureAuthenticated, VotacaoController.listarVotos);

// Registrar voto (vereador autenticado pode votar)
router.post("/votos", ensureAuthenticated, VotacaoController.registrarVoto);

export default router;

