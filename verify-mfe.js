const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const OUT = '/tmp/mfe-screenshots'
fs.mkdirSync(OUT, { recursive: true })

;(async () => {
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
  await page.click('button:has-text("Entrar")')
  await page.waitForURL('**/portal')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${OUT}/02-portal.png` })
  console.log('✅ Portal captured')

  // Check cards
  const availableCards = await page.locator('text=Abrir').count()
  const requestCards = await page.locator('text=Solicitar Degustação').count()
  console.log(`✅ Available app cards: ${availableCards}, Restricted: ${requestCards}`)

  // Check sidebar
  const adminNav = await page.locator('text=Administração').isVisible()
  console.log(`✅ Admin nav visible: ${adminNav}`)

  // Admin > Apps
  await page.click('text=Aplicações')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${OUT}/03-admin-apps.png` })
  console.log('✅ Admin Apps captured')

  // Admin > Users
  await page.click('text=Usuários')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${OUT}/04-admin-users.png` })
  console.log('✅ Admin Users captured')

  // Admin > Permissions
  await page.click('text=Permissões')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${OUT}/05-admin-permissions.png` })
  console.log('✅ Admin Permissions (matrix) captured')

  // Admin > Requests
  await page.click('text=Solicitações')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${OUT}/06-admin-requests.png` })
  console.log('✅ Admin Requests captured')

  // Test "Solicitar Degustação" as regular user
  await page.click('text=Sair')
  await page.click('button:has-text("Usuário Padrão")')
  await page.click('button:has-text("Entrar")')
  await page.waitForURL('**/portal')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${OUT}/07-portal-user.png` })
  console.log('✅ Portal (user view) captured')

  const requestBtn = page.locator('button:has-text("Solicitar Degustação")').first()
  if (await requestBtn.count() > 0) {
    await requestBtn.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/08-request-modal.png` })
    console.log('✅ Request modal captured')
  }

  await browser.close()
  console.log('\nAll screenshots saved to', OUT)
})().catch(e => { console.error('❌', e.message); process.exit(1) })
