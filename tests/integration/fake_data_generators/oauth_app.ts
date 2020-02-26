import { OAuthAppModel } from "@app/model"
import uid2 from "uid2"
import { FakeDataGenerator } from "./types"

export class OAuthAppFakeDataGenerator extends OAuthAppModel implements FakeDataGenerator {
  static randomApp(id: number): OAuthAppFakeDataGenerator {
    let clientId = uid2(255)
    let clientSecret = uid2(255)

    return OAuthAppFakeDataGenerator.construct(id, clientId, clientSecret)
  }

  private static construct(
    id: number,
    clientId: string,
    clientSecret: string
  ): OAuthAppFakeDataGenerator {
    return new OAuthAppFakeDataGenerator(id, clientId, clientSecret, new Date(), new Date())
  }

  async create(): Promise<void> {
    await this.findOrCreateSelf()
  }
}
