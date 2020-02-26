import { Container, createResolve } from "@owja/ioc"

export const ID = {
  JOB_QUEUE_MANAGER: Symbol.for("job_queue_manager"),
  JOB: Symbol.for("job"),
  GITHUB_HTTP_SERVICE: Symbol.for("http_service"),
  GITHUB_API: Symbol.for("github_api")
}

export const container = new Container()
export const resolve = createResolve(container)
