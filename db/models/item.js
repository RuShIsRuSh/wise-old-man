module.exports = (sequelize, DataTypes) => {
    const Item = sequelize.define('Item', {
        name: DataTypes.STRING,
        icon: DataTypes.STRING,
        icon_large: DataTypes.STRING,
        description: DataTypes.STRING,
        members: DataTypes.TINYINT,
        query: DataTypes.STRING
    }, {
        timestamps: false
    });

    // Item.associate = models => {
    //     // associations can be defined here
    // };

    return Item;
};
