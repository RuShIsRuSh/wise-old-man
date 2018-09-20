module.exports = (sequelize, DataTypes) => {
    const Inventory = sequelize.define('Inventory', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        value: DataTypes.STRING
    }, {});

    return Inventory;
};
