import express from "express"
import expressRoutesVersioning from "express-routes-versioning"
import * as controller010 from "@app/controller/0.1.0/admin"
import passport from "passport"
import { getMiddleware } from "./util"

const routesVersioning = expressRoutesVersioning()
const router = express.Router()

/**
 * @apiDefine Endpoint_POST_add_app
 *
 * @apiName Save OAuth app
 * @apiDescription Add a new OAuth app to the server
 */
router.post(
  "/admin/add_app",
  passport.authenticate("admin_bearer_auth", { session: false }),
  routesVersioning({
    "0.1.0": getMiddleware(controller010.addOAuthApp)
  })
)

export default router
