# Running the Server Using Docker Compose

This is the recommended method to run the server locally.

## Installation

1. Sign up for a Grafana Cloud [account](https://grafana.com/auth/sign-up/create-user) if you'd like to [observe](grafana-cloud.md) the system using Grafana Cloud.
2. Install [Docker](https://docs.docker.com/get-docker/).
3. Clone the repo using one of the following methods:

   - SSH:

     ```shell
     git clone git@github.com:leapwallet/observatory.git
     ```

   - HTTPS:

     ```shell
     git clone https://github.com/leapwallet/observatory.git
     ```

4. Change the directory:

   ```shell
   cd observatory
   ```

5. Create a file named `.env`, and set the [environment variables](docs/env.md).

## Usage

1. Start the server on `http://localhost:3000`:

   ```shell
   docker compose up --build -d
   ```

2. Shut down once you're done:

   ```shell
   docker compose down
   ```
