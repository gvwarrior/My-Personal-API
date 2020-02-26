import { validationResult } from "express-validator/check"
import { RequestHandler } from "express"
import { StatusCodes, FieldsError } from "@app/responses"

export interface FieldError {
  location: string
  msg: string
  param: string
}

export const ValidateParamsMiddleware: RequestHandler = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res
      .status(StatusCodes.FieldsError)
      .send(new FieldsError((errors.array() as unknown) as FieldError[]))
  } else {
    return next()
  }
}
