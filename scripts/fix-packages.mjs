import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n')
}

// npm に該当バージョンが存在するか
function isPublished(pkgName, version) {
  try {
    execSync(`pnpm -s view ${pkgName}@${version} version`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
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

// --- keep wrapper (apizel) in sync (ONLY when base version is published) ---
const wrapperPkgPath = path.resolve('packages/apizel-npm/package.json')
if (fs.existsSync(wrapperPkgPath)) {
  const wrapperPkg = readJson(wrapperPkgPath)

  const targetVersion = apizelPkg.version

  // provenance / metadata（wrapper 側も一応揃える）: これは常に更新してOK
  wrapperPkg.repository = {
    type: 'git',
    url: 'https://github.com/liha-labs/apizel.git',
    directory: 'packages/apizel-npm',
  }
  wrapperPkg.homepage = 'https://apizel.liha.dev/'
  wrapperPkg.bugs = { url: 'https://github.com/liha-labs/apizel/issues' }

  wrapperPkg.files = [
    'dist/*.js',
    'dist/*.cjs',
    'dist/*.d.ts',
    'dist/*.d.cts',
    'README.md',
    'LICENSE',
    'package.json',
  ]

  // 重要：npm に存在する時だけ version/deps を追従
  if (isPublished('@liha-labs/apizel', targetVersion)) {
    wrapperPkg.version = targetVersion
    wrapperPkg.dependencies ??= {}
    wrapperPkg.dependencies['@liha-labs/apizel'] = `^${targetVersion}`
    console.log(`synced wrapper -> ${targetVersion}`)
  } else {
    console.log(`skip wrapper sync: @liha-labs/apizel@${targetVersion} is not published yet`)
  }

  writeJson(wrapperPkgPath, wrapperPkg)
  console.log('updated:', wrapperPkgPath)
} else {
  console.log('skip: packages/apizel-npm/package.json not found')
}
