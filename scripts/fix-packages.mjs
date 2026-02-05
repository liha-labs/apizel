import fs from 'node:fs'
import path from 'node:path'

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n')
}

// --- source of truth: @liha-labs/apizel ---
const apizelPkgPath = path.resolve('packages/apizel/package.json')
const apizelPkg = readJson(apizelPkgPath)

// provenance 用
apizelPkg.repository = {
  type: 'git',
  url: 'https://github.com/liha-labs/apizel.git',
  directory: 'packages/apizel',
}
apizelPkg.homepage = 'https://apizel.liha.dev/'
apizelPkg.bugs = { url: 'https://github.com/liha-labs/apizel/issues' }

// 軽量化: sourcemap を publish に入れない
apizelPkg.files = [
  'dist/*.js',
  'dist/*.cjs',
  'dist/*.d.ts',
  'dist/*.d.cts',
  'README.md',
  'LICENSE',
  'package.json',
]

writeJson(apizelPkgPath, apizelPkg)
console.log('updated:', apizelPkgPath)

// --- keep wrapper (apizel) in sync ---
const wrapperPkgPath = path.resolve('packages/apizel-npm/package.json')
if (fs.existsSync(wrapperPkgPath)) {
  const wrapperPkg = readJson(wrapperPkgPath)

  // version を揃える
  wrapperPkg.version = apizelPkg.version

  // dependency を揃える（^<same-version>）
  wrapperPkg.dependencies ??= {}
  wrapperPkg.dependencies['@liha-labs/apizel'] = `^${apizelPkg.version}`

  // provenance / metadata（wrapper 側も一応揃える）
  wrapperPkg.repository = {
    type: 'git',
    url: 'https://github.com/liha-labs/apizel.git',
    directory: 'packages/apizel-npm',
  }
  wrapperPkg.homepage = 'https://apizel.liha.dev/'
  wrapperPkg.bugs = { url: 'https://github.com/liha-labs/apizel/issues' }

  // wrapper も .map を含めない
  wrapperPkg.files = [
    'dist/*.js',
    'dist/*.cjs',
    'dist/*.d.ts',
    'dist/*.d.cts',
    'README.md',
    'LICENSE',
    'package.json',
  ]

  writeJson(wrapperPkgPath, wrapperPkg)
  console.log('updated:', wrapperPkgPath)
} else {
  console.log('skip: packages/apizel-npm/package.json not found')
}
