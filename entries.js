const express = require('express');
const router = express.Router();

// Import the existing Journal Entry model
const Entry = require('./models/JournalEntry');

// 2. GET all entries
router.get('/', async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. POST a new entry
router.post('/', async (req, res) => {
  const entry = new Entry(req.body);
  try {
    const newEntry = await entry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. DELETE an entry
router.delete('/:id', async (req, res) => {
  try {
    await Entry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. GET mood stats
router.get('/stats/moods', async (req, res) => {
  try {
    const stats = await Entry.aggregate([{ $group: { _id: '$mood', count: { $sum: 1 } } }]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. GET wellness stats
router.get('/stats/wellness', async (req, res) => {
  try {
    const stats = await Entry.aggregate([{ $group: { _id: null, avgSleep: { $avg: '$sleepHours' }, exerciseDays: { $sum: { $cond: ['$exercise', 1, 0] } }, meditationDays: { $sum: { $cond: ['$meditation', 1, 0] } } } }]);
    res.json(stats[0] || { avgSleep: 0, exerciseDays: 0, meditationDays: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;