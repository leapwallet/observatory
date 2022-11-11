# Contributing

## Repo Setup

Create the following [GitHub Actions secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository):

|           Key           | Explanation           | Example                                    |
| :---------------------: | --------------------- | ------------------------------------------ |
|   `AWS_ACCESS_KEY_ID`   | AWS access key ID     | `UI8AXAYDRAIO908DN3G6`                     |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `ki8jEGn/VN2ViuOP88Fj4t+pzvDRP/VNJKL7hfGZ` |

## Installation

1. Sign up for a Grafana Cloud [account](https://grafana.com/auth/sign-up/create-user) if you'd like to [observe](grafana-cloud.md) the system using Grafana Cloud.
2. Install [Node.js 16](https://nodejs.org/en/download/).
3. Install [Docker](https://docs.docker.com/get-docker/).
4. Clone the repo using one of the following methods:

   - SSH:

     ```shell
     git clone git@github.com:leapwallet/observatory.git
     ```

   - HTTPS:

     ```shell
     git clone https://github.com/leapwallet/observatory.git
     ```

5. Change the directory:

   ```shell
   cd observatory
   ```

6. Install the package manager:

   ```shell
   corepack enable
   ```

7. Install the dependencies:

   ```shell
   yarn
   ```

8. Create a file named `.env`, and [configure](env.md) the environment variables.

## Development

```shell
yarn dev
```

Starts a hot reload server on the URL printed to the console with a debugger listening on the URL printed to the console.

## Production

Here's how to run a production build locally for a sanity check before deploying it to the cloud:

1. Start the server on http://localhost:3000:

   ```shell
   docker compose up --build -d
   ```

2. Shut down once you're done:

   ```shell
   docker compose down
   ```

## Testing

### Running

```shell
yarn test
```

The debugger's URL will be printed to the console.

### Writing

We'll use an example to explain how to write tests.

Let's say we have a file `src/myDir/Calculator.ts` with the following contents:

```ts
export default class Calculator {
  add(num1: number, num2: number): number {
    return num1 + num2;
  }
}
```

Then, the tests must be saved to a file `tests/unit/myDir/Calculator.test.ts` with the following contents:

```ts
import Calculator from '../Calculator';

describe('Calculator', () => {
  describe('add', () => {
    it('adds <1> and <2> to return <3>', () => expect(new Calculator().add(1, 2)).toBe(3));
  });
});
```

## Linting

Commands will exit with an error code if unresolved issues remain.

- Lint using every tool in one go (slower):

  - Find all issues:

    ```shell
    yarn lint:check
    ```

  - Fix all issues:

    ```shell
    yarn lint:fix
    ```

- Lint using specific tools (faster):

  - Find issues using Prettier:

    ```shell
    yarn lint:prettier:check
    ```

  - Fix issues using Prettier:

    ```shell
    yarn lint:prettier:fix
    ```

  - Find issues using ESLint:

    ```shell
    yarn lint:eslint:check
    ```

  - Fix issues using ESLint:

    ```shell
    yarn lint:eslint:fix
    ```

  - Find issues using tsc:

    ```shell
    yarn lint:tsc
    ```

## Branches

- Only commit to the `staging` branch when releasing a new version. This branch is automatically deployed to the staging environment.
- Whenever a production deployment is to be made, the `prod` branch will be recreated from the `staging` branch.

## Style Guide

- The convention in the TypeScript ecosystem to be to use _kebab-case_ for anything that isn't a TypeScript file except for `.d.ts` files, and _PascalCase_ and _camelCase_ for `.ts` files depending on the type of `export`s that they have but this is difficult to follow, and frankly quite stupid considering how many random baseless rules there are. Therefore, just name all files and directories using _kebab-case_.
- Prefer `type`s over `interface`s in TypeScript as `interface`s are verbose, may accidentally be extended if another `interface` has the same name, and are meant to either be implemented in `class`es or implicitly extended by users of a library .
- Use immutability by default by preferring `const` over `let`, and marking fields as `readonly` whenever possible.
- Treat acronyms and abbreviations as words (e.g., `DefaultApi` instead of `DefaultAPI`, `htmlDoc` instead of `HTMLDoc`, `Db` instead of `DB`). JavaScript keeps acronyms capitalized (e.g., `innerHTML`), but it's impractical to follow (e.g., `DbId` is better than `DBID`).

## Packages

Never use dynamic version ranges for dependencies because packages often break in newer versions. For example,
when `yarn add`ing a dependency, remove the caret from the version number it saved to `package.json`.
