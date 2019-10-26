# Dual Package Hazard

This repo contains an example of how even without [divergent specifiers](https://github.com/nodejs/modules/issues/371), package authors can run into issues when depending on a dual CommonJS/ES Module package.

In this example, `x-core` is a “base” package, the center of an ecosystem of packages. `x-commonjs-plugin` and `x-es-module-plugin` are two other packages that each depend on `x-core`.

`x-core` uses [package exports](https://nodejs.org/api/esm.html#esm_package_exports) to define the following:
- `'x-core'` points to the CommonJS transpilation of the package (`node_modules/x-core/x-core.cjs`).
- `'x-core/module'` points to the ES module source version of the package (`node_modules/x-core/x-core.mjs`).

The ES module `x-es-module-plugin` references `x-core` via `import { X } from 'x-core/module'`.

The CommonJS `x-commonjs-plugin` references `x-core` via `const { X } = require('x-core')`.

## See for yourself

1. Make sure you’re running Node.js 13 or later (as of this writing Node 13.0.1).
1. Clone this repo.
1. Navigate to this repo and run `npm test`.

You should see output like this:

```
> dual-esm-commonjs-package@1.0.0 test ~/dual-package-hazard
> node --experimental-modules index.mjs

(node:17022) ExperimentalWarning: The ESM module loader is experimental.
Running ES module plugin:
Success
Running CommonJS plugin:
TypeError: Please pass an X!
    at run (file://~/dual-package-hazard/node_modules/x-core/x-core.mjs:9:11)
    at file://~/dual-package-hazard/index.mjs:16:2
    at ModuleJob.run (internal/modules/esm/module_job.js:109:37)
    at async Loader.import (internal/modules/esm/loader.js:133:24)
```

## Explanation

The issue is that the `x-core` singleton provided by `'x-core'` is not the same as that provided by `'x-core/module'`. When an `instanceof` check compares one to the other, the check fails (the exception printed above).

The conditions necessary to cause the issue illustrated by this repo aren’t that unlikely. Consider this hypothetical:

1. The package `x-core` has been publishing a CommonJS version for years, and many plugins (like `x-commonjs-plugin`) have sprung up around it.
1. Node.js starts supporting ES module syntax, and the author of `x-core` adds support via `'x-core/module'` while keeping the root `'x-core'` unchanged, to avoid breaking backward compatibility.
1. Someone creates a new plugin for `x-core` using ES module syntax (`x-es-module-plugin`), and that plugin references `x-core` via `x-core/module`.

The end user, which is the root of this repo, is unaware of the various references to `x-core` happening inside `node_modules`. Their imports consist only of this:

```js
import { run } from 'x-core/module';
import x1 from 'x-es-module-plugin';
import x2 from 'x-commonjs-plugin';
```

So the end user isn’t doing anything “wrong”—they’re not importing both `'x-core'` and `'x-core/module'`, at least as far as they’re aware. The two versions both end up getting loaded via dependencies.
