import { statSync } from 'fs'
import { chmodr, chmodrSync } from '../src/index.js'
import t, { type Test } from 'tap'
import { resolve } from 'path'

// Windows is weird with modes
const MODEMASK = process.platform === 'win32' ? 0o600 : 0o777
const MODEEXPECT = process.platform === 'win32' ? 0o600 : 0o700

const getDirs = (t: Test) => {
  t.testdir({
    a: {
      b: {
        c: {
          d: '',
        },
        d: '',
        e: {},
      },
      c: '',
    },
    b: '',
  })
  return ['a', 'a/b', 'a/b/c', 'a/b/c/d', 'a/b/d', 'a/b/e', 'a/c', 'b']
}

const verify = (t: Test, dirs: string[]) => {
  const root = t.testdirName
  for (const dir of dirs) {
    t.test('verify ' + dir, async t => {
      t.equal(
        statSync(resolve(root, dir)).mode & MODEMASK,
        MODEEXPECT,
        `should be mode 0o${MODEEXPECT.toString(8)}`,
      )
    })
  }
}

t.test('async', async t => {
  const dirs = getDirs(t)
  await chmodr(t.testdirName, MODEEXPECT)
  verify(t, dirs)
})

t.test('sync', t => {
  const dirs = getDirs(t)
  chmodrSync(t.testdirName, MODEEXPECT)
  verify(t, dirs)
  t.end()
})

t.test('chmod errors are raised', async t => {
  const { chmodr, chmodrSync } = await t.mockImport<
    typeof import('../src/index.js')
  >('../src/index.js', {
    fs: t.createMock(await import('fs'), {
      chmodSync: () => {
        throw Object.assign(new Error('poopy'), { code: 'EPOOP' })
      },
    }),
    'fs/promises': t.createMock(await import('fs/promises'), {
      chmod: async () => {
        throw Object.assign(new Error('poopy'), { code: 'EPOOP' })
      },
    }),
  })
  const dir = t.testdir({ a: 'b' })
  t.rejects(chmodr(dir, 0o755), { code: 'EPOOP' })
  t.throws(() => chmodrSync(dir, 0o755), { code: 'EPOOP' })
})

t.test('non-ENOTDIR readdir errors are raised', async t => {
  const { chmodr, chmodrSync } = await t.mockImport<
    typeof import('../src/index.js')
  >('../src/index.js', {
    fs: t.createMock(await import('fs'), {
      readdirSync: () => {
        throw Object.assign(new Error('poopy'), { code: 'EPOOP' })
      },
    }),
    'fs/promises': t.createMock(await import('fs/promises'), {
      readdir: async () => {
        throw Object.assign(new Error('poopy'), { code: 'EPOOP' })
      },
    }),
  })
  const dir = t.testdir({ a: 'b' })
  t.rejects(chmodr(dir, 0o755), { code: 'EPOOP' })
  t.throws(() => chmodrSync(dir, 0o755), { code: 'EPOOP' })
})
