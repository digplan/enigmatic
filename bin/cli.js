#!/usr/bin/env bun
import { existsSync, statSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)

const homeDir = join(homedir(), '.vanilla-light')
const userConfigPath = join(homeDir, 'config.json')
const localConfigPath = join(process.cwd(), 'config.json')
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const defaultConfig = {
  use_plugins: [],
  port: 3000,
  disable_ssl: false,
  certs_dir: 'certs',
}

const readJson = async (file) => {
  if (!existsSync(file)) return null
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8'))
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
  } catch {}
  return null
}

const packageVersion = (await readJson(new URL('../package.json', import.meta.url)))?.version || 'unknown'

const loadConfig = async () => {
  const userConfig = await readJson(userConfigPath)
  if (userConfig) return { config: { ...defaultConfig, ...userConfig }, path: userConfigPath }

  const localConfig = await readJson(localConfigPath)
  if (localConfig) return { config: { ...defaultConfig, ...localConfig }, path: localConfigPath }

  return { config: { ...defaultConfig }, path: userConfigPath }
}

const saveConfig = async (config) => {
  await mkdir(homeDir, { recursive: true })
  await writeFile(userConfigPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
}

const expectValue = (name, value) => {
  if (value !== undefined) return value
  throw new Error(`Missing value for ${name}`)
}

const pluginExists = (plugin) => existsSync(join(projectRoot, 'src', 'plugins', plugin))
const certsDirExists = (dir) => {
  const resolved = isAbsolute(dir) ? dir : resolve(process.cwd(), dir)
  if (!existsSync(resolved)) return false
  return statSync(resolved).isDirectory()
}

const printHelp = () => {
  console.log(`
vanilla-light v${packageVersion}

Usage:
  vlserver start
  vlserver config
  vlserver port <number>
  vlserver insecure <true|false>
  vlserver certsdir <path>
  vlserver +plugin <plugin-path>
  vlserver -plugin <plugin-path>
`)
}

let { config, path: configPath } = await loadConfig()
let shouldSave = false
let shouldShowConfig = false
let shouldStart = false

if (args.length === 0) {
  printHelp()
  process.exit(0)
}

for (let i = 0; i < args.length; i++) {
  const arg = args[i]

  if (arg === 'start') {
    shouldStart = true
    continue
  }

  if (arg === 'config') {
    shouldShowConfig = true
    continue
  }

  if (arg === 'port') {
    const raw = expectValue('port', args[++i])
    const parsed = Number(raw)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      throw new Error(`Invalid port: ${raw}`)
    }
    config.port = parsed
    shouldSave = true
    continue
  }

  if (arg === 'insecure') {
    const raw = expectValue('insecure', args[++i]).trim().toLowerCase()
    if (raw !== 'true' && raw !== 'false') {
      throw new Error(`Invalid insecure value: ${raw} (expected true or false)`)
    }
    config.disable_ssl = raw === 'true'
    shouldSave = true
    continue
  }

  if (arg === 'certsdir') {
    const dir = expectValue('certsdir', args[++i]).trim()
    if (!dir) throw new Error('certsdir cannot be empty')
    if (!certsDirExists(dir)) {
      throw new Error(`certsdir does not exist: ${dir}`)
    }
    config.certs_dir = dir
    shouldSave = true
    continue
  }

  if (arg === '+plugin') {
    const plugin = expectValue('+plugin', args[++i]).trim()
    if (!plugin) throw new Error('+plugin cannot be empty')
    if (!pluginExists(plugin)) {
      throw new Error(`Plugin not found in plugins folder: src/plugins/${plugin}`)
    }
    config.use_plugins ||= []
    if (!config.use_plugins.includes(plugin)) config.use_plugins.push(plugin)
    shouldSave = true
    shouldShowConfig = true
    continue
  }

  if (arg === '-plugin') {
    const plugin = expectValue('-plugin', args[++i]).trim()
    if (!plugin) throw new Error('-plugin cannot be empty')
    config.use_plugins ||= []
    config.use_plugins = config.use_plugins.filter((name) => name !== plugin)
    shouldSave = true
    shouldShowConfig = true
    continue
  }

  throw new Error(`Unknown argument: ${arg}`)
}

if (shouldSave) {
  await saveConfig(config)
  configPath = userConfigPath
}

if (shouldShowConfig) {
  console.log(`config path: ${configPath}`)
  console.log(JSON.stringify(config, null, 2))
}

if (!shouldStart) {
  process.exit(0)
}

const { createServer } = await import('../src/server.js')
const server = createServer({ port: config.port })
console.log(`server starting on ${server.tls ? 'https' : 'http'}://localhost:${server.port}...`)
Bun.serve(server)
