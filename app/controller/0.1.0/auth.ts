import { OAuthAppModel } from "@app/model"
import { Success, UserEnteredBadDataError, Unauthorized } from "@app/responses"
import { Endpoint } from "@app/controller/type"
import { body } from "express-validator/check"
import { container, ID } from "@app/di"
import { GitHubApiService, GetAccessTokenMobileSuccess, GetAccessTokenResponse } from "@app/service"
import constants from "@app/constants"

/**
 * @apiDefine AuthSuccess_010
 * @apiSuccessExample {json} Success-Response:
 *     {
 *        message: "Human readable successful message",
 *        response: {
 *          access_token: string
 *          scope: string,
 *          token_type: string
 *        }
 *     }
 */
class AuthSuccess extends Success {
  constructor(message: string, public response: GetAccessTokenResponse) {
    super(message)
  }
}

/**
 * @api {post} /auth Authenticate web application to GitHub
 * @apiVersion 0.1.0
 * @apiGroup Auth
 * @apiUse Endpoint_POST_auth
 *
 * @apiParam {string} client_id Client ID of your GitHub OAuth app
 * @apiParam {string} code Code received from GitHub authenticate page user visited.
 * @apiParam {string} state *Optional* If you added a "state" param to the GitHub authenticate webpage, include that here.
 *
 * @apiUse AuthSuccess_010
 * @apiError UserEnteredBadDataError (status code: 400) OAuth application does not exist.
 */
export const auth: Endpoint = {
  validate: [body("client_id").isString(), body("code").isString()],
  endpoint: async (req, res, next) => {
    const body: {
      client_id: string
      code: string
      state?: string
    } = req.body

    const getAccessToken = async (): Promise<void> => {
      const OAuthApp = await OAuthAppModel.findByClientId(body.client_id)
      if (!OAuthApp) {
        return Promise.reject(
          new UserEnteredBadDataError(
            `OAuth application with client_id: ${body.client_id} does not exist`
          )
        )
      }

      let githubApiService: GitHubApiService = container.get(ID.GITHUB_API)
      let accessTokenResult = await githubApiService.getAccessToken(
        OAuthApp.clientId,
        OAuthApp.clientSecret,
        body.code,
        body.state
      )

      return Promise.reject(new AuthSuccess("Success!", accessTokenResult))
    }

    getAccessToken().catch(next)
  }
}

/**
 * @apiDefine AuthMobileSuccess_010
 * @apiSuccessExample {json} Success-Response:
 *     {
 *        message: "Human readable successful message",
 *        response: {
 *          access_token: string,
 *          auth_url: string
 *        }
 *     }
 */
class AuthMobileSuccess extends Success {
  constructor(message: string, public response: GetAccessTokenMobileSuccess) {
    super(message)
  }
}

/**
 * @apiDefine UnauthorizedAuthMobileError_010
 * @apiErrorExample {json} Error-Response:
 *     {
 *        message: "Human readable error message",
 *        error_type: 'wrong_username_or_password' | 'invalid_oauth_app' | '2fa_sms' | '2fa_app'
 *     }
 */
class UnauthorizedAuthMobileError extends Unauthorized {
  constructor(public message: string, public errorType: string) {
    super()
  }
}

/**
 * @api {post} /auth/mobile Authenticate mobile application to GitHub
 * @apiVersion 0.1.0
 * @apiGroup Auth
 * @apiUse Endpoint_POST_authMobile
 *
 * @apiParam {string} client_id Client ID of your GitHub OAuth app
 * @apiParam {string} scopes Array of scopes for permissions to read. See: https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/#available-scopes
 * @apiParam {string} username Username for GitHub account to login with
 * @apiParam {string} password Password for GitHub account to login with
 * @apiParam {string} two_fac_auth Optional. Code given to you via 2FA login method.
 *
 * @apiUse AuthMobileSuccess_010
 * @apiError UserEnteredBadDataError (status code: 400) OAuth application does not exist.
 * @apiUse UnauthorizedAuthMobileError_010
 */
export const authMobile: Endpoint = {
  validate: [
    body("client_id").isString(),
    body("username").isString(),
    body("password").isString(),
    body("scopes").isArray(),
    body("scopes.*").isString(),
    body("two_fac_auth")
      .optional({ nullable: true })
      .isString()
  ],
  endpoint: async (req, res, next) => {
    const body: {
      client_id: string
      username: string
      password: string
      scopes: string[]
      two_fac_auth?: string
    } = req.body

    const getAccessToken = async (): Promise<void> => {
      const OAuthApp = await OAuthAppModel.findByClientId(body.client_id)
      if (!OAuthApp) {
        return Promise.reject(
          new UserEnteredBadDataError(
            `OAuth application with client_id: ${body.client_id} does not exist`
          )
        )
      }

      let githubApiService: GitHubApiService = container.get(ID.GITHUB_API)
      let accessTokenResult = await githubApiService.getAccessTokenMobile(
        OAuthApp.clientId,
        OAuthApp.clientSecret,
        constants.githubAuth.authMobileNotes,
        body.scopes,
        body.username,
        body.password,
        body.two_fac_auth || null
      )

      if (accessTokenResult.error) {
        return Promise.reject(
          new UnauthorizedAuthMobileError(
            accessTokenResult.error.message,
            accessTokenResult.error.errorType
          )
        )
      } else {
        return Promise.reject(new AuthMobileSuccess("Success!", accessTokenResult.success!))
      }
    }

    getAccessToken().catch(next)
  }
}
