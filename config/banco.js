import Sequelize from 'sequelize'
import dotenv from 'dotenv'
dotenv.config()


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,{
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  timezone: '-03:00',
})

try {
  await sequelize.authenticate()
  console.log('Conectado ao banco com sucesso!')
} catch (error) {
  console.error('Falha na conexão:', error)
}

export default { Sequelize, sequelize }