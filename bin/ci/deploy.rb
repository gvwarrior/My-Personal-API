require 'trent'
require 'uri'

api_version = File.open('Versionfile') {|f| f.readline}

# Edit the variables below. 
aws_image_name = "331988467157.dkr.ecr.us-east-1.amazonaws.com/foundersclubsoftware/devclass-api"
prod_image_name = "#{aws_image_name}:prod-#{api_version}"
honeybadger_deploy_local_user = "FC Software"
name_of_docker_application = "devclass-api"
##########################

ci = Trent.new()

application_directory_to_save_to_on_server = "~/#{ENV["TRAVIS_REPO_SLUG"].split("/")[1]}"

deploy_user = ENV["PROD_DEPLOY_USER"]
deploy_host = ENV["PROD_DEPLOY_HOST"]
git_commit = ENV["TRAVIS_COMMIT"]
env_image_name = prod_image_name
env = "production"
migration = env
env_file = ".env.production"

##############

ci.config_ssh(deploy_user, deploy_host)

docker_login_command = "eval \$(docker run --rm -i -e \"AWS_ACCESS_KEY_ID=#{ENV['AWS_ACCESS_KEY_ID']}\" -e \"AWS_SECRET_ACCESS_KEY=#{ENV['AWS_SECRET_ACCESS_KEY']}\" -e \"AWS_DEFAULT_REGION=#{ENV['AWS_DEFAULT_REGION']}\" -e \"AWS_DEFAULT_OUTPUT=#{ENV['AWS_DEFAULT_OUTPUT']}\" jdrago999/aws-cli aws ecr get-login --no-include-email --region us-east-1)"

# Push newly built image to AWS.
ci.sh("docker build -f docker/app/Dockerfile-prod -t #{env_image_name} .")
ci.sh(docker_login_command)
ci.sh("docker push #{env_image_name}")

# Deploy 
ci.ssh("mkdir -p #{application_directory_to_save_to_on_server}/docker;")
ci.sh("scp -r docker/ #{deploy_user}@#{deploy_host}:#{application_directory_to_save_to_on_server}/docker")
ci.sh("scp -r CHANGELOG.md .env* #{deploy_user}@#{deploy_host}:#{application_directory_to_save_to_on_server}/")
ci.ssh(docker_login_command)
ci.ssh("docker pull #{env_image_name}")
ci.ssh("docker stop #{name_of_docker_application}", :fail_non_success => false)
ci.ssh("docker rm -f #{name_of_docker_application}", :fail_non_success => false)

ci.sh("npm run _production:build") # to build the sequelize database config files. 
# exports all env variables from .env file, ignoring lines that start with '#', and then runs migration command. 
ci.sh("export $(grep -v '^#' #{env_file} | xargs) && npx sequelize db:migrate --debug --env #{migration}")

ci.ssh("cd #{application_directory_to_save_to_on_server}; DOCKER_IMAGE_NAME=#{env_image_name} API_VERSION=#{api_version} /opt/bin/docker-compose -f docker/app/docker-compose.yml -f docker/app/docker-compose.prod.override.yml up -d")

# Honeybadger deploy
deploy_url = URI::encode("https://api.honeybadger.io/v1/deploys?"\
  "deploy[environment]=#{env}&"\
  "deploy[local_username]=#{honeybadger_deploy_local_user}&"\
  "deploy[repository]=git@github.com:#{ENV['TRAVIS_REPO_SLUG']}.git&"\
  "deploy[revision]=#{git_commit}&"\
  "api_key=#{ENV['HONEY_BADGER_API_KEY']}")

ci.sh("curl -ig \"#{deploy_url}\"")
