# Mandrel Take-home Assignment

This repo implements a web app which syncs with real-time user data of a Slack workspace. New team additions and changes to user profiles will be detected and reflected in the web app as they occur.

## How It Works

- Next.js: Next was chosen as a full-stack framework, as the expected business logic was simple enough to avoid a dedicated back-end framework.
- Webhooks: The app receives event data from Slack by consuming the webhooks Slack sends after subscribing a receiving /slack-events endpoint to their event subscriptions. This data is sent to the Next.js server where data is persisted to the PostGres DB.
- SSE: For a truly real-time experience, in parallel the data is sent to all active clients in order to populate those UI with changes. I employed stateful server-side event streams (SSE) which are stored in a simple in-memory list on the server to identify and stream new changes to clients. This should be upgraded to a dedicated Redis session store of some kind if we are looking at any kind of scale. Depending on future requirements, WebSocket connections may have been a better choice for bi-directional streaming, but currently SSE is sufficient for lower overhead and unidirectional server updates.
- PostGres: The app currently syncs the full Slack user list with the DB upon every web app load, which is not intended in production, but was useful during development for this small-scale MVP. The server, as long as it is up, should continue to receive updates from Slack and maintain a source of truth in the DB.
- Heroku: Canonically, Next.js applications are deployed via Vercel to take advantage of serverless runtimes. However, because I am storing sessions in memory on the Next.js server, I needed a long-lived server, such as through Heroku, to continue to reference the global session list, which isn't easily done in a serverless environment.
- Initialization: Docker-compose is the simplest way to get the app up and running locally, it sets up dependent containers in the right order and executes an idempotent PostGres table setup script.

## Getting Started

This web app is containerized and is backed by a PostGreSQL database for persistence. The docker compose application can be started up with `docker-compose up`. Please make sure you have docker installed beforehand.

A sample `.env.sample` file is provided. You may fill this in with the requisite Slack API secrets and rename to `.env.local` to start up the app locally. Please make sure you are referencing the proper Docker container hostname of your DB. It may be advantageous to override environment variables in the `docker-compose.yaml`.

## Deployment

The deployed app is hosted on Heroku [here](https://intense-island-77184-c3fa8c04843f.herokuapp.com/). This app is connected to Daniel's [Mandrel Take-home Slack Workspace](mandrel-takehome.slack.com). Although the app is structured as a Docker compose app per requirements, hosting was simplified by deploying on an opinionated service like Heroku, as opposed to AWS ECS or raw EC2. Heroku's free-tier dynos were also a consideration.
