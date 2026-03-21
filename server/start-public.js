#!/usr/bin/env node
/**
 * LániCAD — Start Server + Cloudflare Tunnel
 * 
 * Starts the Express API server and a Cloudflare Quick Tunnel,
 * then registers the tunnel URL with the server for CORS.
 * 
 * Usage: node start-public.js
 */
require('dotenv').config()
const { spawn, execSync } = require('child_process')
const http = require('http')

const PORT = process.env.PORT || 3001

// Colors for console
const green = (s) => `\x1b[32m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`
const cyan = (s) => `\x1b[36m${s}\x1b[0m`
const red = (s) => `\x1b[31m${s}\x1b[0m`

console.log(cyan('\n══════════════════════════════════════'))
console.log(cyan('  LániCAD — Public Server Launcher'))
console.log(cyan('══════════════════════════════════════\n'))

// 1. Start Express server
console.log(yellow('Starting Express API server...'))
const server = spawn('node', ['index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env },
})

server.stdout.on('data', (data) => {
  const line = data.toString().trim()
  if (line) console.log(`  [API] ${line}`)
})

server.stderr.on('data', (data) => {
  const line = data.toString().trim()
  if (line) console.error(red(`  [API ERROR] ${line}`))
})

// Wait for server to be ready
function waitForServer(retries = 30) {
  return new Promise((resolve, reject) => {
    function check(attempt) {
      if (attempt >= retries) return reject(new Error('Server did not start'))
      const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
        if (res.statusCode === 200) return resolve()
        setTimeout(() => check(attempt + 1), 500)
      })
      req.on('error', () => setTimeout(() => check(attempt + 1), 500))
    }
    check(0)
  })
}

async function start() {
  try {
    await waitForServer()
    console.log(green(`  API server ready on port ${PORT}\n`))

    // 2. Start Cloudflare Tunnel
    console.log(yellow('Starting Cloudflare Tunnel...'))
    
    // Check if cloudflared is available
    try {
      execSync('cloudflared --version', { stdio: 'pipe' })
    } catch {
      console.error(red('  cloudflared not found! Install: winget install Cloudflare.cloudflared'))
      console.log(yellow(`  Server is still running at http://localhost:${PORT}`))
      return
    }

    const tunnel = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${PORT}`], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let tunnelUrl = null

    // cloudflared outputs the URL to stderr
    tunnel.stderr.on('data', (data) => {
      const line = data.toString()
      // Look for the tunnel URL
      const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
      if (match && !tunnelUrl) {
        tunnelUrl = match[0]
        console.log(green('\n  ┌─────────────────────────────────────────────┐'))
        console.log(green(`  │  PUBLIC URL: ${tunnelUrl}`))
        console.log(green('  │  Share this URL with others!'))
        console.log(green('  └─────────────────────────────────────────────┘\n'))

        // Register tunnel URL with server for CORS
        const postData = JSON.stringify({ url: tunnelUrl })
        // First login as admin to get token
        const loginData = JSON.stringify({ email: 'admin@lanicad.is', password: 'admin123' })
        const loginReq = http.request({
          hostname: 'localhost', port: PORT, path: '/api/auth/login',
          method: 'POST', headers: { 'Content-Type': 'application/json' },
        }, (res) => {
          let body = ''
          res.on('data', chunk => body += chunk)
          res.on('end', () => {
            try {
              const { token } = JSON.parse(body)
              // Now register tunnel
              const regReq = http.request({
                hostname: 'localhost', port: PORT, path: '/api/tunnel',
                method: 'POST', headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }, (res) => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => console.log(cyan(`  Tunnel registered with CORS ✓`)))
              })
              regReq.write(postData)
              regReq.end()
            } catch (e) {
              console.error(red('  Could not register tunnel URL'))
            }
          })
        })
        loginReq.write(loginData)
        loginReq.end()
      }

      // Show connection status
      if (line.includes('Registered tunnel connection')) {
        console.log(cyan('  Tunnel connection registered ✓'))
      }
    })

    tunnel.on('close', (code) => {
      console.log(yellow(`  Tunnel closed (code ${code})`))
    })

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log(yellow('\n  Shutting down...'))
      tunnel.kill()
      server.kill()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      tunnel.kill()
      server.kill()
      process.exit(0)
    })

  } catch (err) {
    console.error(red(`Error: ${err.message}`))
    server.kill()
    process.exit(1)
  }
}

start()
