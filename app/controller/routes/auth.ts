import express from "express"
import expressRoutesVersioning from "express-routes-versioning"
import * as controller010 from "@app/controller/0.1.0/auth"
import { getMiddleware } from "./util"

const router = express.Router()
const routesVersioning = expressRoutesVersioning()

/**
 * @apiDefine Endpoint_POST_auth
 *
 * @apiName Authenticate web application with GitHub
 * @apiDescription Get access token for logged in GitHub user account.
 */
router.post(
  "/auth",
  routesVersioning({
    "0.1.0": getMiddleware(controller010.auth)
  })
)

/**
 * @apiDefine Endpoint_POST_authMobile
 *
 * @apiName Authenticate mobile application with GitHub
 * @apiDescription Get access token for logged in GitHub user account.
 */
router.post(
  "/auth/mobile",
  routesVersioning({
    "0.1.0": getMiddleware(controller010.authMobile)
  })
)

export default router
