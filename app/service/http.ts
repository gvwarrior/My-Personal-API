import axios from "axios"

export const githubApiAxiosInstance = axios.create({
  baseURL: "https://api.github.com/",
  validateStatus: function(status) {
    return true
  }
})
