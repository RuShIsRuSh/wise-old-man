module.exports = (sequelize, DataTypes) => {
    const Link = sequelize.define('Link', {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        rsn: DataTypes.STRING
    }, {});

    // Link.associate = models => {
    //     // associations can be defined here
    // };

    return Link;
};
