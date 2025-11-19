import banco from "../config/banco.js";

const Usuario = banco.sequelize.define('Usuario',{
    id:{
        type: banco.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome:{
        type: banco.Sequelize.STRING(100)
    },
    senha:{
        type: banco.Sequelize.STRING(100)
    },
    email:{
        type: banco.Sequelize.STRING(100)
    },
    cpf:{
        type: banco.Sequelize.STRING(11)
    },
    tipo:{
        type: banco.Sequelize.INTEGER
    },
    partido_id: {
        type: banco.Sequelize.INTEGER,
        allowNull: true
    }
})

Usuario.associate = (modelos) => {
    Usuario.belongsTo(modelos.Partido, {
        foreignKey: 'partido_id',
        constraint: true,
        onDelete: 'RESTRICT',
        as: 'partido'
    });
    Usuario.hasMany(modelos.Projeto,{
        foreignKey: 'usuario_id'
    });
    Usuario.hasMany(modelos.Voto,{
        foreignKey: 'usuario_id'
    })
};

export default Usuario