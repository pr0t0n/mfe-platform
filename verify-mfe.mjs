import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const OUT = '/tmp/mfe-screenshots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1440, height: 900 })

// 1. Login page
await page.goto('http://localhost:5173/login')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: `${OUT}/01-login.png`, fullPage: false })
console.log('✅ Login capturada')

// Login as admin
await page.fill('input[type="email"]', 'admin@empresa.com')
await page.fill('input[type="password"]', 'admin123')
await page.click('button[type="submit"]')
await page.waitForURL('**/portal')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: `${OUT}/02-portal-admin.png` })
console.log('✅ Portal Admin capturada')

// Verify app cards and sidebar
const openLinks = await page.locator('text=Abrir').count()
const adminSection = await page.locator('text=Administração').isVisible()
console.log(`✅ Apps disponíveis com "Abrir": ${openLinks} | Admin sidebar: ${adminSection}`)

// Permissions matrix
await page.click('text=Permissões')
await page.waitForLoadState('networkidle')
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/03-permissions.png` })
console.log('✅ Permissões capturada')

// Admin Apps
await page.click('text=Aplicações')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: `${OUT}/04-admin-apps.png` })
console.log('✅ Admin Apps capturada')

// Logout and login as regular user
await page.click('text=Sair')
await page.waitForURL('**/login')
await page.fill('input[type="email"]', 'joao@empresa.com')
await page.fill('input[type="password"]', '123456')
await page.click('button[type="submit"]')
await page.waitForURL('**/portal')
await page.waitForLoadState('networkidle')
await page.screenshot({ path: `${OUT}/05-portal-user.png` })
console.log('✅ Portal User capturada')

const requestBtns = await page.locator('button:has-text("Solicitar Degustação")').count()
const noAdminSection = !(await page.locator('text=Administração').isVisible())
console.log(`✅ Botões "Solicitar Degustação": ${requestBtns} | Sem admin sidebar: ${noAdminSection}`)

// Click on an available app to test iframe
await page.locator('text=Abrir').first().click()
await page.waitForTimeout(600)
await page.screenshot({ path: `${OUT}/06-app-viewer.png` })
console.log('✅ App Viewer (iframe) capturada')

// Check app bar elements
const backBtn = await page.locator('text=Portal').first().isVisible()
console.log(`✅ Botão "Portal" (voltar) visível: ${backBtn}`)

await browser.close()
console.log('\n📁 Screenshots em:', OUT)
