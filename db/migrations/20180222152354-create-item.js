module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Items', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            icon: {
                type: Sequelize.STRING
            },
            icon_large: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.STRING
            },
            members: {
                type: Sequelize.TINYINT
            },
            query: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: queryInterface => {
        return queryInterface.dropTable('Items');
    }
};
