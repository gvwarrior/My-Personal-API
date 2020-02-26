import { GitHubApiService } from "@app/service"

export const getMockGitHubApiService = (): GitHubApiService => {
  return {
    getAccessToken: jest.fn(),
    getAccessTokenMobile: jest.fn()
  }
}
