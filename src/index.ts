
import 'colors'
import 'vx-util'

import { spawnSync } from 'child_process'
import { promises as fs } from 'fs'
import { resolve } from 'path'

const NPM = 'yarn'

const { info } = console

info('======'.white, 'create-rts-fullstack start'.blue)
info()
info('!!'.red, 'this tool is designed to work with yarn and utilizes yarn workspaces')
info('if you are currently using npm, please switch to yarn in order for')
info('this toolset to work')
info()

async function init (cwd: string = process.cwd()): Promise<string> {
  info('---'.white, 'init'.cyan)
  const { status, error } = spawnSync(NPM, [ 'init' ], { cwd, shell: true, stdio: 'inherit' })

  if (error) throw error
  if (status) throw new Error('yarn init exited non-zero: ' + status)
  return cwd
}

async function updatePackage (cwd: string): Promise<{ cwd: string, pkg: PackageJSON.IPackage }> {
  const pkgPath = resolve(cwd, 'package.json')
  const pkg = require(pkgPath) as PackageJSON.IPackage
  info()
  info('core package name:', pkg.name, 'v' + pkg.version)

  info()
  info('---'.white, 'dependencies'.cyan)
  info('updating workspaces...')
  const newPkg = {
    ...pkg,
    private: true,
    scripts: {
      start: 'node .'
    },
    workspaces: [ 'src/*', 'project' ]
  }
  await fs.writeFile(pkgPath, JSON.stringify(newPkg, null, 2))
  await fs.writeFile(resolve(cwd, '.yarnrc'), 'workspaces-experimental true')

  return { cwd, pkg }
}

init()
  .then(updatePackage)
  .catch(err => {
    info('!!'.red, 'failed to create package'.yellow)
    console.error(err)
  })
