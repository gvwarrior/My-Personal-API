import { ErrorRequestHandler } from "express"
import * as logger from "@app/logger"
import { isProduction } from "@app/util"
import { StatusCodes, SystemError } from "@app/responses"

export const DefaultErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err) {
    logger.error(err)

    if (res.headersSent) {
      next(err)
    } else {
      const message = isProduction ? "System error. Please try again." : err.message
      res.status(StatusCodes.SystemError).send(new SystemError(message))
    }
  }
}
