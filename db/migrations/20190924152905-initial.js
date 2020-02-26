"use strict"

/**
 * This is the migration that sets up the initial schema of the database. Sequelize.sync() is a bad idea to use in production and instead you should manually create the initial schema. That's what this is.
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable("oauth_app", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        clientId: { type: Sequelize.STRING, allowNull: false, unique: true },
        clientSecret: { type: Sequelize.STRING, allowNull: false, unique: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false }
      })
    ])
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.dropTable("oauth_app")])
  }
}
