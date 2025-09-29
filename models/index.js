import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import banco from '../config/banco.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};

const modelos = fs
  .readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js');

for (const arquivo of modelos) {
  const filePath = path.join(__dirname, arquivo);
  const fileUrl = pathToFileURL(filePath);
  const modelModule = await import(fileUrl);
  const modelo = modelModule.default;
  db[modelo.name] = modelo;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = banco.sequelize;
db.Sequelize = banco.Sequelize;

export default db;