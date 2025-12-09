import { statSync } from 'fs'
import { chmodr, chmodrSync } from '../src/index.js'
import t from 'tap'
import { resolve } from 'path'

// Windows is weird with modes
const MODEMASK = process.platform === 'win32' ? 0o600 : 0o777
const MODEEXPECT = process.platform === 'win32' ? 0o600 : 0o700

t.test('async', async t => {
  const dir = resolve(
    t.testdir({
      dir: {
        'sh-link': t.fixture('symlink', '/bin/sh'),
      },
    }),
    'dir',
  )

  await chmodr(dir, MODEEXPECT)
  t.equal(statSync(dir).mode & MODEMASK, MODEEXPECT)
  await chmodr(dir, 0o644)
  t.pass('completed successfully (do not expect mode to change)')
})

t.test('sync', t => {
  const dir = resolve(
    t.testdir({
      dir: {
        'sh-link': t.fixture('symlink', '/bin/sh'),
      },
    }),
    'dir',
  )

  chmodrSync(dir, MODEEXPECT)
  t.equal(statSync(dir).mode & MODEMASK, MODEEXPECT)
  chmodrSync(dir, 0o644)
  t.pass('completed successfully (do not expect mode to change)')
  t.end()
})
