import { AxiosInstance } from "axios"
import { ID, resolve } from "@app/di"
import { StatusCodes, GitHubApiStatusCodes } from "@app/responses"
import * as util from "@app/util"

export interface GetAccessTokenResponse {
  access_token: string
  scope: string
  token_type: string
}

export interface GetAccessTokenMobileResponse {
  error?: GetAccessTokenMobileError
  success?: GetAccessTokenMobileSuccess
}

export interface GetAccessTokenMobileError {
  message: string
  errorType:
    | "wrong_username_or_password"
    | "invalid_oauth_app"
    | "2fa_sms"
    | "2fa_app"
    | "verify_email_address"
}

export interface GetAccessTokenMobileSuccess {
  accessToken: string
  authUrl: string
}

export interface GitHubApiService {
  getAccessToken(
    clientId: string,
    clientSecret: string,
    code: string,
    state?: string
  ): Promise<GetAccessTokenResponse>

  getAccessTokenMobile(
    clientId: string,
    clientSecret: string,
    note: string,
    scopes: string[],
    username: string,
    password: string,
    twoFacAuth: string | null
  ): Promise<GetAccessTokenMobileResponse>
}

export class AppGitHubApiService implements GitHubApiService {
  constructor(private axios: AxiosInstance = resolve<AxiosInstance>(ID.GITHUB_HTTP_SERVICE)()) {}

  getAccessToken(
    clientId: string,
    clientSecret: string,
    code: string,
    state?: string
  ): Promise<GetAccessTokenResponse> {
    return this.axios.post(
      "login/oauth/access_token",
      {
        /* eslint-disable @typescript-eslint/camelcase */
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        state: state
        /* eslint-enable @typescript-eslint/camelcase */
      },
      {
        headers: {
          Accept: "application/json"
        }
      }
    )
  }

  async getAccessTokenMobile(
    clientId: string,
    clientSecret: string,
    note: string,
    scopes: string[],
    username: string,
    password: string,
    twoFacAuth: string | null
  ): Promise<GetAccessTokenMobileResponse> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let headers: any = {
      "User-Agent": "FC-Software-DevClass",
      "Content-Type": "application/json"
    }
    if (twoFacAuth) {
      headers["x-github-otp"] = twoFacAuth
    }

    let response = await this.axios.post(
      "authorizations",
      {
        /* eslint-disable @typescript-eslint/camelcase */
        client_id: clientId,
        client_secret: clientSecret,
        scopes: scopes,
        note: note
        /* eslint-enable @typescript-eslint/camelcase */
      },
      {
        auth: {
          username: username,
          password: password
        },
        responseType: "json",
        headers: headers
      }
    )

    if (response.status == StatusCodes.Unauthorized) {
      let errorResponse: GetAccessTokenMobileError
      if (response.data.message === "Bad credentials") {
        errorResponse = {
          message: "Sorry! The username or password is incorrect.",
          errorType: "wrong_username_or_password"
        }
      } else if (response.data.message === "Invalid Application client_id or secret.") {
        errorResponse = {
          message: response.data.message,
          errorType: "invalid_oauth_app"
        }
      } else if (response.headers["X-GitHub-OTP"] === "required; SMS") {
        errorResponse = {
          message:
            "You have 2 factor auth enabled for your account. Enter the code sent to your via SMS and try again.",
          errorType: "2fa_sms"
        }
      } else if (response.headers["X-GitHub-OTP"] === "required; app") {
        errorResponse = {
          message:
            "You have 2 factor auth enabled for your account. Enter the code sent to your via your 2FA app and try again.",
          errorType: "2fa_app"
        }
      } else {
        throw Error(`Unhandled response when unauthorized. Response: ${util.stringify(response)}`)
      }

      return {
        error: errorResponse
      }
    }

    if (response.status == StatusCodes.FieldsError) {
      if (
        response.data.errors[0].message ===
        "user must have a verified email address in order to authenticate via OAuth"
      ) {
        return {
          error: {
            message:
              "Sorry! You must have a verified email address in order to login. Check out https://github.com/settings/emails to verify.",
            errorType: "verify_email_address"
          }
        }
      }
    }

    if (response.status == GitHubApiStatusCodes.GetAccessTokenSuccess) {
      return {
        success: {
          accessToken: response.data.token,
          authUrl: response.data.url
        }
      }
    } else {
      throw Error(`Unhandled response. Response: ${util.stringify(response)}`)
    }
  }
}
