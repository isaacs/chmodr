import * as fs from 'node:fs'
import * as path from 'node:path'
import * as fsp from 'node:fs/promises'

/* c8 ignore start */
const LCHMOD =
  'lchmod' in fs && typeof fs.lchmod === 'function' ? 'lchmod' : 'chmod'
const LCHMODSYNC =
  'lchmodSync' in fs && typeof fs.lchmodSync === 'function' ?
    'lchmodSync'
  : 'chmodSync'
/* c8 ignore stop */

// If a party has r, add x
// so that dirs are listable
const dirMode = (mode: number) => {
  if (mode & 0o400) mode |= 0o100
  if (mode & 0o40) mode |= 0o10
  if (mode & 0o4) mode |= 0o1
  return mode
}

const chmodrKid = async (p: string, child: fs.Dirent, mode: number) => {
  if (child.isDirectory()) {
    await chmodr(path.resolve(p, child.name), mode)
    await fsp.chmod(path.resolve(p, child.name), dirMode(mode))
  } else {
    await fsp[LCHMOD](path.resolve(p, child.name), mode)
  }
}

export const chmodr = async (p: string, mode: number) => {
  const children = await fsp
    .readdir(p, { withFileTypes: true })
    .catch(async er => {
      if ((er as NodeJS.ErrnoException).code !== 'ENOTDIR') throw er
      /* c8 ignore start - overly cautious, we only explore dirs */
      await fsp[LCHMOD](p, mode)
    })
  if (!children) return
  /* c8 ignore stop */

  await Promise.all(children.map(async child => chmodrKid(p, child, mode)))
  await fsp.chmod(p, dirMode(mode))
}

const chmodrKidSync = (p: string, child: fs.Dirent, mode: number) => {
  if (child.isDirectory()) {
    chmodrSync(path.resolve(p, child.name), mode)
    fs.chmodSync(path.resolve(p, child.name), dirMode(mode))
  } else fs[LCHMODSYNC](path.resolve(p, child.name), mode)
}

export const chmodrSync = (p: string, mode: number) => {
  let children
  try {
    children = fs.readdirSync(p, { withFileTypes: true })
    /* c8 ignore start - overly cautious, we only explore dirs */
  } catch (er) {
    if ((er as NodeJS.ErrnoException).code === 'ENOTDIR') {
      return fs[LCHMODSYNC](p, mode)
    }
    /* c8 ignore stop */
    throw er
  }

  for (const child of children) {
    chmodrKidSync(p, child, mode)
  }

  return fs.chmodSync(p, dirMode(mode))
}
