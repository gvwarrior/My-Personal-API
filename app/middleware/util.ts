import mung, { Transform } from "express-mung"
import { RequestHandler } from "express"
import { DefaultErrorHandler } from "./default_error_handler"

mung.onError = DefaultErrorHandler

type TransformBodyHandler = Transform

export const getTransformResponseBodyMiddleware = (
  handler: TransformBodyHandler
): RequestHandler => {
  return mung.json(handler, {
    mungError: true
  })
}
