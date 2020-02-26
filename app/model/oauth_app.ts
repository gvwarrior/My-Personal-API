import { Sequelize, DataTypes } from "sequelize"
import { Model, SequelizeModel } from "./type"

export class OAuthAppSequelizeModel extends SequelizeModel {
  public id!: number
  public clientId!: string
  public clientSecret!: string
  public createdAt!: Date
  public updatedAt!: Date

  static initModel(sequelize: Sequelize): void {
    OAuthAppSequelizeModel.init(
      {
        clientId: { type: DataTypes.STRING, allowNull: false, unique: true },
        clientSecret: { type: DataTypes.STRING, allowNull: false, unique: true }
      },
      {
        modelName: "oauth_app",
        sequelize: sequelize
      }
    )
  }

  static setupAssociations(): void {}

  getModel(): OAuthAppModel {
    return new OAuthAppModel(
      this.id,
      this.clientId,
      this.clientSecret,
      this.createdAt,
      this.updatedAt
    )
  }
}

export interface OAuthAppPublic {
  id: number
}

export interface OAuthAppPrivate {
  id: number
  clientId: string
  clientSecret: string
}

export class OAuthAppModel implements Model<OAuthAppPublic> {
  constructor(
    public id: number,
    public clientId: string,
    public clientSecret: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static findByClientId(clientId: string): Promise<OAuthAppModel | null> {
    return OAuthAppSequelizeModel.findOne({
      where: {
        clientId: clientId
      }
    }).then(res => (res ? res.getModel() : null))
  }

  static async create(clientId: string, clientSecret: string): Promise<OAuthAppModel> {
    let res = await OAuthAppSequelizeModel.create({
      clientId: clientId,
      clientSecret: clientSecret
    })

    return res.getModel()
  }

  findOrCreateSelf(): Promise<OAuthAppModel> {
    return OAuthAppSequelizeModel.findCreateFind({
      where: {
        id: this.id
      },
      defaults: {
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      }
    }).then(res => res[0].getModel())
  }

  publicRepresentation(): OAuthAppPublic {
    return {
      id: this.id
    }
  }

  privateRepresentation(): OAuthAppPrivate {
    return {
      id: this.id,
      clientId: this.clientId,
      clientSecret: this.clientSecret
    }
  }
}
