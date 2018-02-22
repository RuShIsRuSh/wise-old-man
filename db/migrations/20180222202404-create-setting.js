module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Settings', {
            name: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            data: {
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
        return queryInterface.dropTable('Settings');
    }
};
