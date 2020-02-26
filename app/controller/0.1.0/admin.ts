import { OAuthAppModel, OAuthAppPrivate } from "@app/model/oauth_app"
import { Success, UserEnteredBadDataError } from "@app/responses"
import { body } from "express-validator/check"
import { Endpoint } from "@app/controller/type"

/**
 * @apiDefine AddOAuthAppAdmin_010
 * @apiSuccessExample {json} Success-Response:
 *     {
 *       "message": "Human readable successful message",
 *       "app": {
 *         id: number
 *         clientId: string
 *         clientSecret: string
 *       }
 *     }
 */
class CreateOAuthAppSuccess extends Success {
  constructor(message: string, public app: OAuthAppPrivate) {
    super(message)
  }
}

/**
 * @api {post} /admin/add_app Create OAuth App
 * @apiUse Endpoint_POST_add_app
 * @apiGroup Admin
 * @apiVersion 0.1.0
 *
 * @apiParam {string} client_id Client ID of your GitHub OAuth app
 * @apiParam {string} client_secret Client secret of your GitHub OAuth app
 *
 * @apiUse AddOAuthAppAdmin_010
 * @apiError UserEnteredBadDataError OAuth application does not exist.
 */
export const addOAuthApp: Endpoint = {
  validate: [body("client_id").isString(), body("client_secret").isString()],
  endpoint: async (req, res, next) => {
    const body: {
      client_id: string
      client_secret: string
    } = req.body

    const createApp = async (): Promise<void> => {
      let existingOAuthApp = await OAuthAppModel.findByClientId(body.client_id)
      if (existingOAuthApp) {
        return Promise.reject(
          new UserEnteredBadDataError(
            `App with client_id: ${
              body.client_id
            } already exists. No need to add it again. If you want to replace it, talk to someone on the API team and they will take care of it.`
          )
        )
      }

      let createdApp = await OAuthAppModel.create(body.client_id, body.client_secret)
      return Promise.reject(
        new CreateOAuthAppSuccess("Successfully created user.", createdApp.privateRepresentation())
      )
    }

    createApp().catch(next)
  }
}
