const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  mood: {
    type: String,
    required: true,
    enum: ['amazing', 'happy', 'okay', 'sad', 'anxious', 'stressed']
  },
  moodEmoji: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  gratitude: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  waterIntake: {
    type: Number,
    min: 0
  },
  exercise: {
    type: Boolean,
    default: false
  },
  meditation: {
    type: Boolean,
    default: false
  },
  activities: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Index for faster date queries
journalEntrySchema.index({ date: -1 });

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

module.exports = JournalEntry;