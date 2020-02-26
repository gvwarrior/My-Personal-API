import { Sequelize, Options } from "sequelize"
import dbConfig, { DatabaseConnection } from "../config/db"
import { env, enableLogging, isDevelopment, isTesting } from "@app/util"
import { OAuthAppSequelizeModel } from "@app/model"

let databaseConnection = (dbConfig as { [key: string]: DatabaseConnection })[env]
let sequelizeConfig: Options = {
  database: databaseConnection.database,
  username: databaseConnection.username,
  password: databaseConnection.password,
  host: databaseConnection.host,
  dialect: databaseConnection.dialect,
  port: databaseConnection.port,
  define: {
    underscored: false, // convert camelCase column names to underscored.
    freezeTableName: true, // Disable pluralizing the table names created in the database.
    timestamps: true, // Adds createdAt and updatedAt timestamps to the model.
    paranoid: false // when deleting rows, actually delete them. Do not set deleted_at timestamp for row instead.
  },
  logging: enableLogging
}

export let sequelize: Sequelize | null

export const initDatabase = async (): Promise<void> => {
  if (sequelize) return

  sequelize = new Sequelize(sequelizeConfig)

  OAuthAppSequelizeModel.initModel(sequelize)

  OAuthAppSequelizeModel.setupAssociations()

  if (isDevelopment || isTesting) {
    await sequelize.sync({
      force: isTesting,
      alter: true
    })
  }

  await sequelize.authenticate()
}

export const resetDatabase = async (): Promise<void> => {
  await sequelize!.drop()
}

export const closeDatabase = async (): Promise<void> => {
  await sequelize!.close()
  sequelize = null
}

export * from "./oauth_app"
