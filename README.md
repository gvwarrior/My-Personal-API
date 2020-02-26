# DevClass-API

API for team members going through the dev class to interact with. This API is meant to be the server that can help finish each of the tasks the dev class requires.

_Note:_ This server will more then likely be interacted with by the web, Android, and iOS client side teams and built/maintained by the API team.

# Getting started

- First, clone this repo:

```
npm install
bundle install
```

- Next, follow all of the directions below in the [services](#Services) section to configuring the services this project is setup to work with.
- When you want to run the application locally on your machine for development purposes, follow the directions for [development](#development).
- If you want to run unit, integration tests for your application, check out the section for [tests](#tests).
- If you wish to deploy your application to the production server, check out the section on [deployment](#deploy).

Enjoy!

# Services

- [Travis CI](https://travis-ci.com/) - CI server to build, test, and deploy the server.

Configure:

1. Go into the [Travis account for FC Software team](https://travis-ci.com/foundersclubsoftware), and enable the GitHub repo for this project.
2. Done. Follow the instructions in this README to learn how to interact with Travis.

- [Danger](http://danger.systems/ruby/) - Bot that looks over my pull requests and make sure I do not forget to complete certain tasks.

Danger is already setup for the project. So what you need to do is to create a secret environment variable in Travis CI - key = `DANGER_GITHUB_API_TOKEN`, value = GitHub OAuth personal token for `fcsoftware-bot`. Tip, this token is already created and is located inside of LastPass.

- [Here are instructions](http://danger.systems/guides/getting_started.html#creating-a-bot-account-for-danger-to-use) for adding a Danger bot to your repo.

* [AWS ECR](https://aws.amazon.com/ecr/) - Host private Docker images built from the API codebase.

The ECR registry is already created for this project. Find it [by logging into your FC Software AWS account](https://console.aws.amazon.com/ecs/home?region=us-east-1#/repositories/). Then, open `bin/app/deployment.rb`. Edit the variables at the top of the file: `aws_image_name`.

The IAM user is already created for ECR access. Look inside of LastPass for `travis-ci IAM` to find the information. Follow [these directions](https://docs.travis-ci.com/user/environment-variables/#Defining-encrypted-variables-in-.travis.yml) to encrypt these sensitive keys and add them to your `.travis.yml` file. For the environment variable names that you use for encryption, use: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

- [Honeybadger](https://www.honeybadger.io/for/node/) - Error reporting

Honeybadger is already setup for this project. The API key is set as an environment variable inside of `.travis.yml` and .env

# Development

_Warning: Make sure to follow the [getting started](#getting-started) section to configure your project before you try and run it locally._

Do you wish to build and run this application locally on your machine for development? Let's do it.

You need Docker and Nodejs installed. That is it!

```bash
npm install
bundle install
npm run dev:setup
npm run dev
```

This will install everything you need, start up services such as Postgres, then start your node application.

## Contribute code to the repository

After your machine is setup for [development](#development), all you need to do is follow these steps:

- Make a git branch off of `master`, make your code edits.
- Make a pull request in GitHub into the `master` branch. Wait until CI build passes, get your code reviewed by your team members, then it gets merged in.

### Debug code in development

To debug your code, this project is setup to work with VSCode's built-in debugger. All you need to do is run the "Local development debug" task in VSCode and done! It will even reset the debugger and recompile your code on code change.

# Tests

This project is setup to create and run unit and integration tests against your code base super easily. For information on how to _write_ tests, check out the `tests/` directory.

```bash
npm run test:setup
npm run test
```

This will run all of your unit and integration tests.

It's recommended that while you are developing your tests you use the [Jest Runner](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner) VSCode extension for when you want to run or debug individual tests.

# Deploy

_Warning: Before you try and deploy your application, you need to follow the directions on getting your [development](#development) environment setup and the application running locally. Also, recommended [your tests](#testing) run and pass._

This project is setup to deploy your Nodejs application via a [Docker](https://www.docker.com/) container.

- First, we need to do some manual setup on the server. SSH into the production server, then:

```bash
cd
mkdir DevClass-API
cd DevClass-API
```

Now, we need to create the environment variables file that will contain application secrets. Copy and paste the contents of the `.env.production` file into the `DevClass-API` directory.

- Now, it's time to deploy our database. This is pretty simple:

```
npm run db:production
```

Run `docker logs db` anytime you wish to see if the database has started successfully. Check the logs in there to see if it looks good.

- Now it's time to setup the application for deployment. The nice thing is that, it's all setup for you! No need to do anything. Travis-CI is setup to do all of the deployment for you.

However, there are a couple of assumptions:

1. This project assumes that you are using Traefik for a reverse proxy.

- So, how do we tell the CI server to make a deployment?

Well, you need to merge in all of the pull requests in the git repo into the `master` branch that you want included in this release. Then, follow the directions given to you when you call `ruby Dangerfile`. Make the changes printed out to you which tell you how to bump the version of the server. Make another pull request into `master`, merge it in, and then it's time to finally deploy.

So, all you need to do to deploy your code is to make a git tag. Do this off of the master branch. Create a git tag:

```
git tag $(cat Versionfile)
git push --tags
```

Now, Travis will take care of deploying for you! Make sure that you check the logs of Travis to make sure it's successful.

# Documentation

This API is uses [apidoc](http://apidocjs.com/) for API documentation.

It is pretty easy to use. View the [official docs](http://apidocjs.com/) on the templating language and generate them using `npm run generate:doc`. Docs are generated in the `doc/` directory.
