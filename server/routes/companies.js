const express = require('express')
const { query } = require('../db')
const requireAuth = require('../middleware/auth')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', requireAuth, async (_req, res) => {
  try {
    const { rows } = await query('SELECT * FROM companies ORDER BY sort, name')
    res.json(rows)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório.' })
    const { rows } = await query('SELECT MAX(sort) AS m FROM companies')
    const sort = (rows[0]?.m || 0) + 1
    await query('INSERT INTO companies (name,sort) VALUES ($1,$2)', [name.trim(), sort])
    res.status(201).json({ ok: true })
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Empresa já existe.' })
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await query('UPDATE companies SET name=$1 WHERE id=$2', [req.body.name?.trim(), req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM companies WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
