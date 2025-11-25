import { statSync } from 'fs'
import { chmodr, chmodrSync } from '../src/index.js'
import t from 'tap'
import { resolve } from 'path'

t.test('async', async t => {
  const dir = resolve(
    t.testdir({
      dir: {
        'sh-link': t.fixture('symlink', '/bin/sh'),
      },
    }),
    'dir',
  )

  await chmodr(dir, 0o700)
  t.equal(statSync(dir).mode & 0o777, 0o700)
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

  chmodrSync(dir, 0o700)
  t.equal(statSync(dir).mode & 0o777, 0o700)
  chmodrSync(dir, 0o644)
  t.pass('completed successfully (do not expect mode to change)')
  t.end()
})
