import { ErrorRequestHandler } from "express"
import {
  ForbiddenError,
  UserEnteredBadDataError,
  Success,
  Unauthorized,
  StatusCodes
} from "@app/responses"

export const ErrorResponseHandlerMiddleware: ErrorRequestHandler = (
  error: ForbiddenError | UserEnteredBadDataError | Success | Error,
  req,
  res,
  next
) => {
  if (error instanceof ForbiddenError) {
    res.status(StatusCodes.ForbiddenError).send(error)
  } else if (error instanceof UserEnteredBadDataError) {
    res.status(StatusCodes.UserEnteredBadDataError).send(error)
  } else if (error instanceof Success) {
    res.status(StatusCodes.Success).send(error)
  } else if (error instanceof Unauthorized) {
    res.status(StatusCodes.Unauthorized).send(error)
  } else {
    next(error)
  }
}
