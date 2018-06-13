dev:
	yarn dev

test:
	yarn && yarn test

deploy_up: test
	up deploy production

deploy_gcloud: test
	gcloud app deploy app.prod.yaml --project "${PROJECT}"

deploy: deploy_up deploy_gcloud
