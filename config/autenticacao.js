import passportLocal from "passport-local";
import bcrypt from "bcryptjs";
import db from "../models/index.js";

const { Usuario } = db;
const LocalStrategy = passportLocal.Strategy;

export default function inicializarPassport(passport) {
  passport.use(
    "usuario-local",
    new LocalStrategy(
      { usernameField: "email", passwordField: "senha" },
      async (email, senha, done) => {
        try {
          const usuario = await Usuario.findOne({ where: { email } });
          if (!usuario) return done(null, false, { message: "Usuário não encontrado" });

          const iguais = await bcrypt.compare(senha, usuario.senha);
          if (!iguais) return done(null, false, { message: "Senha incorreta" });

          return done(null, usuario);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((usuario, done) => done(null, usuario.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) return done(null, false);
      return done(null, usuario);
    } catch (err) {
      return done(err);
    }
  });
}

// Middlewares de autenticação e permissão
export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Usuário não autenticado." });
}

export function checkRole(role) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    if (req.user.tipo !== role) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    next();
  };
}
