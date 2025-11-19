import banco from "../config/banco.js";

const Projeto = banco.sequelize.define('Projeto',{
    id:{
        type: banco.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo:{
        type: banco.Sequelize.STRING(100)
    },
    ementa:{
        type: banco.Sequelize.TEXT
    },
    autor:{
        type: banco.Sequelize.STRING(100)
    },
    tipo:{
        type: banco.Sequelize.STRING(100)
    },
    dt_votacao:{
        type: banco.Sequelize.DATE
    },
    usuario_id: {
        type: banco.Sequelize.INTEGER,
        allowNull: false
    }
})
Projeto.associate = (modelos) => {
    Projeto.belongsTo(modelos.Usuario, {
        foreignKey: 'usuario_id',
        constraint: true,
        onDelete: 'RESTRICT',
        as: 'usuario'
    });
    Projeto.hasMany(modelos.Voto,{
        foreignKey: 'projeto_id'
    })
}

export default Projeto