/*
The reason we don't have this code in <app.ts> is because the test files require <import>ing <app>, and if the server
started during the tests, then they wouldn't run properly.
 */

import injectDependencies from './dependency-injector';

// Inject dependencies before importing the <app> because the <app> has top-level code requiring dependencies.
injectDependencies();

import { getLogger } from './logger';
import { EnvVars } from './env-vars';
import app from './app';

const port = EnvVars.getPort();
app.listen(port, () => getLogger(__filename).notice(`Listening on http://localhost:${port}`));
