import Sequelize from 'sequelize'

const DB_NAME = 'sistema_votacao'
const USER_NAME = 'postgres'
const PASSWORD = '97520'
const HOST = 'localhost'
const PORT = 5432

const sequelize = new Sequelize(DB_NAME, USER_NAME, PASSWORD, {
  host: HOST,
  port: PORT, 
  dialect: 'postgres',
  timezone: '-03:00',
})

await sequelize.authenticate()
  .then(() => {
    console.log('Conectado ao banco com sucesso!')
  })
  .catch((error) => {
    console.error('Falha na conexão:', error)
  })

export default { Sequelize, sequelize }