import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const OUT = '/tmp/mfe-screenshots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 800 })

// 1. Login page
await page.goto('http://localhost:5173/login')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: `${OUT}/01-login.png` })
console.log('✅ Login page captured')

// Quick login as admin
await page.click('button:has-text("Admin")')
await page.click('button[type="submit"]')
await page.waitForURL('**/portal')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: `${OUT}/02-portal-admin.png` })
console.log('✅ Portal (admin) captured')

const availableCards = await page.locator('text=Abrir').count()
const requestCards = await page.locator('text=Solicitar Degustação').count()
console.log(`✅ Cards com acesso: ${availableCards}, Restritos: ${requestCards}`)

const adminNav = await page.locator('text=Administração').isVisible()
console.log(`✅ Seção Admin na sidebar: ${adminNav}`)

// Admin > Permissions matrix
await page.click('text=Permissões')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: `${OUT}/03-permissions-matrix.png` })
console.log('✅ Matriz de permissões capturada')

// Admin > Apps
await page.click('text=Aplicações')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: `${OUT}/04-admin-apps.png` })
console.log('✅ Admin Apps capturada')

// Admin > Requests
await page.click('text=Solicitações')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: `${OUT}/05-admin-requests.png` })
console.log('✅ Admin Requests capturada')

// Test user view
await page.click('text=Sair')
await page.waitForURL('**/login')
await page.click('button:has-text("Usuário Padrão")')
await page.click('button[type="submit"]')
await page.waitForURL('**/portal')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: `${OUT}/06-portal-user.png` })
console.log('✅ Portal (usuário padrão) capturada')

const userRequestBtns = await page.locator('button:has-text("Solicitar Degustação")').count()
console.log(`✅ Botões "Solicitar Degustação": ${userRequestBtns}`)

// Open request modal
const firstBtn = page.locator('button:has-text("Solicitar Degustação")').first()
if (await firstBtn.count() > 0) {
  await firstBtn.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/07-request-modal.png` })
  console.log('✅ Modal de solicitação capturado')
}

await browser.close()
console.log('\n📁 Screenshots em:', OUT)
