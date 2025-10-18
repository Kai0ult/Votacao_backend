import banco from "../config/banco.js";

const Partido = banco.sequelize.define('Partido',{
    id:{
        type: banco.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome:{
        type: banco.Sequelize.STRING(100)
    },
    sigla:{
        type: banco.Sequelize.STRING(100)
    }
})

Partido.associate = (modelos) => {
    Partido.hasMany(modelos.Usuario, {
        foreignKey: 'partido_id'
    });
};

export default Partido