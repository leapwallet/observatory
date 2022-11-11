# Running the Server in the Cloud

This is the recommended method to run the server in the cloud. For example, you might use this method if you're running it in production. There's no point in running more than one instance of this microservice at the same time but this can be done during something like a rolling update without any consequences.

## Installation

1. Sign up for a Grafana Cloud [account](https://grafana.com/auth/sign-up/create-user) if you'd like to [observe](grafana-cloud.md) the system using Grafana Cloud.
2. Set up the server:

   1. Clone the repo using one of the following methods:

      - SSH:

        ```shell
        git clone git@github.com:leapwallet/observatory.git
        ```

      - HTTPS:

        ```shell
        git clone https://github.com/leapwallet/observatory.git
        ```

   2. Change the directory:

      ```shell
      cd observatory
      ```

   3. Build the Docker image:

      ```shell
      docker build .
      ```

   4. Run the Docker image on port 3,000 (this can be overridden using the `PORT` environment variable). For example, [GCP Run](https://cloud.google.com/run/), [AWS Fargate](https://aws.amazon.com/fargate/). It's recommended to allocate 0.25 vCPUs, and 0.5 GiB of memory.
   5. Set the [environment variables](env.md).
