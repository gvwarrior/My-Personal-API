import { setup, serverRequest, endpointVersionHeader } from "@test/integration/index"
import uid2 from "uid2"
import { StatusCodes } from "@app/responses"
import { OAuthAppFakeDataGenerator } from "@test/integration/fake_data_generators"
import { container, ID } from "@app/di"
import { endpointVersion } from "./index"
import {
  GitHubApiService,
  GetAccessTokenResponse,
  GetAccessTokenMobileResponse
} from "@app/service"
import { getMockGitHubApiService } from "@test/mocks"
import constants from "@app/constants"

let githubApiServiceMock: GitHubApiService
beforeEach(() => {
  githubApiServiceMock = getMockGitHubApiService()
})

const overrideDependencies = (): void => {
  container.rebind<GitHubApiService>(ID.GITHUB_API).toValue(githubApiServiceMock)
}

describe(`Authenticate web application with GitHub. ${endpointVersion}`, () => {
  const endpoint = "/auth"

  it("should error missing client_id param", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ code: "123" })
      .expect(StatusCodes.FieldsError)
  })
  it("should error missing code param", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .send({ client_id: "123" })
      .set(endpointVersionHeader(endpointVersion))
      .expect(StatusCodes.FieldsError)
  })
  it("should error oauth application does not exist", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .send({ client_id: "123", code: "123" })
      .set(endpointVersionHeader(endpointVersion))
      .expect(StatusCodes.UserEnteredBadDataError)
  })
  it("should succeed. Get GitHub access token.", async () => {
    let response: GetAccessTokenResponse = {
      access_token: uid2(100),
      token_type: "Bearer",
      scope: "public"
    }
    githubApiServiceMock.getAccessToken = jest.fn().mockResolvedValueOnce(response)

    const testOAuthApp = OAuthAppFakeDataGenerator.randomApp(1)
    await setup([testOAuthApp], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ client_id: testOAuthApp.clientId, code: "123" })
      .expect(StatusCodes.Success)
      .then(res => {
        expect(githubApiServiceMock.getAccessToken).toBeCalledTimes(1)
        expect(res.body.response).toEqual(response)
      })
  })
})

describe(`Authenticate mobile application with GitHub. ${endpointVersion}`, () => {
  const endpoint = "/auth/mobile"

  it("should error missing client_id param", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ username: "123", password: "123", scopes: ["public"] })
      .expect(StatusCodes.FieldsError)
  })
  it("should error missing username param", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ client_id: "123", password: "123", scopes: ["public"] })
      .expect(StatusCodes.FieldsError)
  })
  it("should error missing password param", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ username: "123", client_id: "123", scopes: ["public"] })
      .expect(StatusCodes.FieldsError)
  })
  it("should error missing scopes param", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ username: "123", password: "123", client_id: "123" })
      .expect(StatusCodes.FieldsError)
  })
  it("should error scopes param not correct format", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({ client_id: "123", username: "123", password: "123", scopes: [{ scope: "public" }] })
      .expect(StatusCodes.FieldsError)
  })
  it("should error oauth application does not exist", async () => {
    await setup([], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .send({ client_id: "123", username: "123", password: "123", scopes: ["public"] })
      .set(endpointVersionHeader(endpointVersion))
      .expect(StatusCodes.UserEnteredBadDataError)
      .then(res => {
        expect(githubApiServiceMock.getAccessTokenMobile).toHaveBeenCalledTimes(0)
      })
  })
  it("should error getting access token. Expect to get error details returned", async () => {
    let serviceResponse: GetAccessTokenMobileResponse = {
      error: {
        message: "There was some error",
        errorType: "invalid_oauth_app"
      }
    }
    githubApiServiceMock.getAccessTokenMobile = jest.fn().mockResolvedValueOnce(serviceResponse)

    let username = "123"
    let password = "123"
    let scopes = ["public"]

    const testOAuthApp = OAuthAppFakeDataGenerator.randomApp(1)
    await setup([testOAuthApp], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({
        client_id: testOAuthApp.clientId,
        username: username,
        password: password,
        scopes: scopes
      })
      .expect(StatusCodes.Unauthorized)
      .then(res => {
        expect(res.body.message).toBe(serviceResponse.error!.message)
        expect(res.body.error_type).toBe(serviceResponse.error!.errorType)
        expect(githubApiServiceMock.getAccessTokenMobile).toBeCalledTimes(1)
        expect(githubApiServiceMock.getAccessTokenMobile).toHaveBeenCalledWith(
          testOAuthApp.clientId,
          testOAuthApp.clientSecret,
          constants.githubAuth.authMobileNotes,
          scopes,
          username,
          password,
          null
        )
      })
  })
  it("should succeed. Get GitHub access token without need of 2FA code.", async () => {
    let serviceResponse: GetAccessTokenMobileResponse = {
      success: {
        accessToken: uid2(20),
        authUrl: "https://github.com/new_auth_app"
      }
    }
    githubApiServiceMock.getAccessTokenMobile = jest.fn().mockResolvedValueOnce(serviceResponse)

    let username = "123"
    let password = "123"
    let scopes = ["public"]

    const testOAuthApp = OAuthAppFakeDataGenerator.randomApp(1)
    await setup([testOAuthApp], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({
        client_id: testOAuthApp.clientId,
        username: username,
        password: password,
        scopes: scopes
      })
      .expect(StatusCodes.Success)
      .then(res => {
        expect(githubApiServiceMock.getAccessTokenMobile).toBeCalledTimes(1)
        expect(githubApiServiceMock.getAccessTokenMobile).toHaveBeenCalledWith(
          testOAuthApp.clientId,
          testOAuthApp.clientSecret,
          constants.githubAuth.authMobileNotes,
          scopes,
          username,
          password,
          null
        )
        expect(res.body.response).toEqual({
          access_token: serviceResponse.success!.accessToken,
          auth_url: serviceResponse.success!.authUrl
        })
      })
  })
  it("should succeed. Get GitHub access token with need of 2FA code.", async () => {
    let serviceResponse: GetAccessTokenMobileResponse = {
      success: {
        accessToken: uid2(20),
        authUrl: "https://github.com/new_auth_app"
      }
    }
    githubApiServiceMock.getAccessTokenMobile = jest.fn().mockResolvedValueOnce(serviceResponse)

    let username = "123"
    let password = "123"
    let twoFacAuth = "code"
    let scopes = ["public"]

    const testOAuthApp = OAuthAppFakeDataGenerator.randomApp(1)
    await setup([testOAuthApp], overrideDependencies)
    await serverRequest()
      .post(endpoint)
      .set(endpointVersionHeader(endpointVersion))
      .send({
        client_id: testOAuthApp.clientId,
        username: username,
        password: password,
        scopes: scopes,
        two_fac_auth: twoFacAuth
      })
      .expect(StatusCodes.Success)
      .then(res => {
        expect(githubApiServiceMock.getAccessTokenMobile).toBeCalledTimes(1)
        expect(githubApiServiceMock.getAccessTokenMobile).toHaveBeenCalledWith(
          testOAuthApp.clientId,
          testOAuthApp.clientSecret,
          constants.githubAuth.authMobileNotes,
          scopes,
          username,
          password,
          twoFacAuth
        )
        expect(res.body.response).toEqual({
          access_token: serviceResponse.success!.accessToken,
          auth_url: serviceResponse.success!.authUrl
        })
      })
  })
})
