const express = require('express');
const router = express.Router();
const { runQuery, getOne, getAll } = require('../database');
const { validateProfile } = require('../middleware/validation');

router.get('/', async (req, res, next) => {
  try {
    const profiles = await getAll('SELECT * FROM voice_profiles WHERE is_deleted = 0');
    res.json({ success: true, data: profiles, count: profiles.length });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const profile = await getOne('SELECT * FROM voice_profiles WHERE id = ? AND is_deleted = 0', [req.params.id]);
    if (!profile) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: profile });
  } catch (error) { next(error); }
});

router.post('/', validateProfile, async (req, res, next) => {
  try {
    const { name, voice_sample, avg_frequency, avg_amplitude } = req.body;
    const result = await runQuery(
      'INSERT INTO voice_profiles (name, voice_sample, avg_frequency, avg_amplitude) VALUES (?, ?, ?, ?)',
      [name, JSON.stringify(voice_sample), avg_frequency, avg_amplitude]
    );
    res.status(201).json({ success: true, data: { id: result.id, name } });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await runQuery('UPDATE voice_profiles SET is_deleted = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Profile deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
