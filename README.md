# CCDC Backend

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Set up repository](#set-up-repository)
3. [Install Node.js packages](#install-nodejs-packages)
4. [Environment variables](#environment-variables)
5. [Start the backend](#start-the-backend)

## Prerequisites

- Opensearch 2.16.0
- Node.js 16.20.0

## Set up repository

Clone this repository with the command

```bash
git clone https://github.com/CBIIT/INS-REST-WebService.git
```

## Install Node.js packages

Run `npm ci`, depending on which package manager you use.

## Environment variables

Create a `.env` file by making a copy of `.env.example`. Change the values of the environment variables in `.env` as appropriate.

For some reason, the following port configuration does not work:

- Backend - `3001`
- Frontend - `3000`

But this configuration does work:

- Backend - `3000`
- Frontend - `3001`

## Start the backend

Ensure that Elasticsearh and MySQL are running, and then run the command

```bash
npm run start
```
