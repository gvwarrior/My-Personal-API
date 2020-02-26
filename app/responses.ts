import { FieldError } from "./middleware/validate_params"

export enum StatusCodes {
  Success = 200,
  SystemError = 500,
  UserEnteredBadDataError = 400,
  ForbiddenError = 403,
  Unauthorized = 401,
  FieldsError = 422
}

export enum GitHubApiStatusCodes {
  GetAccessTokenSuccess = 201
}

export class Success {
  constructor(public message: string) {}
}

/**
 * @apiDefine SystemError
 */
export class SystemError {
  constructor(public message: string) {}
}

/**
 * @apiDefine UserEnteredBadDataError
 */
export class UserEnteredBadDataError {
  constructor(public errorMessage: string) {}
}

/**
 * @apiDefine ForbiddenError
 */
export class ForbiddenError {
  constructor(public errorMessage: string) {}
}

/**
 * @apiDefine Unauthorized
 */
export class Unauthorized {}

export class FieldsError {
  constructor(public errors: FieldError[], public message: string = errors[0].msg) {
    if (errors.length <= 0) {
      throw new Error("FieldsError got constructed, but without any error objects given.")
    }
  }
}
