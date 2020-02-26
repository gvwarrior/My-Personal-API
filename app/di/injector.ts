import { container, ID } from "@app/di"
import { AppGitHubApiService, GitHubApiService } from "@app/service/github_api"
import { githubApiAxiosInstance } from "@app/service/http"
import { AxiosInstance } from "axios"

export const performInitialInjection = (): void => {
  container.bind<AxiosInstance>(ID.GITHUB_HTTP_SERVICE).toValue(githubApiAxiosInstance)

  container.bind<GitHubApiService>(ID.GITHUB_API).to(AppGitHubApiService)
}
