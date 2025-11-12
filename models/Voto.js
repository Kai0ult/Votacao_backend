import banco from "../config/banco.js";

const Voto = banco.sequelize.define('Voto',{
    opcao:{
        type: banco.Sequelize.INTEGER
    },
    usuario_id: {
        type: banco.Sequelize.INTEGER,
        allowNull: false
    },
    projeto_id: {
        type: banco.Sequelize.INTEGER,
        allowNull: false
    }
})

Voto.associate = (modelos) => {
    Voto.belongsTo(modelos.Usuario, {
        foreignKey: 'usuario_id',
        constraint: true,
        onDelete: 'RESTRICT',
        as: 'usuario'
    });
    Voto.belongsTo(modelos.Projeto, {
        foreignKey: 'projeto_id',
        constraint: true,
        onDelete: 'RESTRICT',
        as: 'projeto'
    })
}

export default Voto