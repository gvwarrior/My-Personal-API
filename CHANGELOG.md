## [0.2.3] - 2019-10-10

## Fix

- Catch verifying email address error from GitHub authorizations endpoint

## [0.2.2] - 2019-10-01

### Fix

- json to string stringify with circular structure. Stop throwing "TypeError: Converting circular structure to JSON"

## [0.2.1] - 2019-09-30

### Fix

- non-200 status codes from github not resolved [#9](https://github.com/foundersclubsoftware/DevClass-API/pull/9).

## [0.2.0] - 2019-09-23

### Added

- Create endpoint for mobile auth with GitHub.

### Changed

- Project uses Docker self-hosted deployments now instead of Zeit.

## [0.1.0] - 2019-08-22

Date of this release is inaccurate. This changelog file is new. Today marks a new refactor, however, from Zeit now to express/Docker.

### Added

- Create endpoint for web applications to get an access token from GitHub API.
- Create admin endpoint to create new OAuth applications.
