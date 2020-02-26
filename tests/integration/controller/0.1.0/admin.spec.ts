import {
  setup,
  serverRequest,
  endpointVersionHeader,
  adminAuthHeader
} from "@test/integration/index"
import uid2 from "uid2"
import { StatusCodes } from "@app/responses"
import { OAuthAppFakeDataGenerator } from "@test/integration/fake_data_generators"
import { endpointVersion } from "./index"
import { OAuthAppModel } from "@app/model"

describe(`Create user ${endpointVersion}`, () => {
  const endpoint = "/admin/add_app"

  const overrideDependencies = (): void => {}

  it("should error no access token.", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .expect(StatusCodes.Unauthorized)
  })
  it("should error bad access token.", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set("Authorization", `Bearer ${uid2(200)}`)
      .set(endpointVersionHeader(endpointVersion))
      .expect(StatusCodes.Unauthorized)
  })
  it("should error missing client_id param.", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(adminAuthHeader())
      .send({ client_secret: "123" })
      .set(endpointVersionHeader(endpointVersion))
      .expect(StatusCodes.FieldsError)
  })
  it("should error missing client_secret param.", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(adminAuthHeader())
      .send({ client_id: "123" })
      .set(endpointVersionHeader(endpointVersion))
      .expect(StatusCodes.FieldsError)
  })
  it("should error oauth app already exists", async () => {
    let existingOAuthApp = OAuthAppFakeDataGenerator.randomApp(1)

    await setup([existingOAuthApp], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(adminAuthHeader())
      .set(endpointVersionHeader(endpointVersion))
      .send({ client_id: existingOAuthApp.clientId, client_secret: existingOAuthApp.clientSecret })
      .expect(StatusCodes.UserEnteredBadDataError)
  })
  it("should create oauth app successfully", async () => {
    let clientId = uid2(50)
    let clientSecret = uid2(50)

    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(adminAuthHeader())
      .set(endpointVersionHeader(endpointVersion))
      .send({ client_id: clientId, client_secret: clientSecret })
      .expect(StatusCodes.Success)
      .then(async res => {
        let createdOAuthApp = await OAuthAppModel.findByClientId(clientId)

        expect(res.body.app).toEqualDecamelize(createdOAuthApp!.privateRepresentation())
      })
  })
})
