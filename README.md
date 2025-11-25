## Description

Has the same effect as the command line command: `chmod -R`.

## Install

```
npm i --save chmodr
```

## Usage

```ts
import { chmodr, chmodrSync } from 'chmodr'
// or:
// const { chmodr, chmodrSync } = require('chmodr')

// async promise style
await chmodr('/var/www/my/test/folder', 0o777)
// sync immediate style
chmodrSync('/some/other/dir', 0o644)
```
