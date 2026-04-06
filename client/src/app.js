import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import './app.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const moodOptions = [
  { value: 'amazing', emoji: '🌟', label: 'Amazing' },
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'stressed', emoji: '😫', label: 'Stressed' }
];

function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    mood: 'happy',
    moodEmoji: '😊',
    title: '',
    content: '',
    gratitude: ['', '', ''],
    sleepHours: '',
    waterIntake: '',
    exercise: false,
    meditation: false
  });

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/entries`);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [moodResponse, wellnessResponse] = await Promise.all([
        axios.get(`${API_URL}/entries/stats/moods`),
        axios.get(`${API_URL}/entries/stats/wellness`)
      ]);
      
      setStats({
        moods: moodResponse.data,
        wellness: wellnessResponse.data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMoodSelect = (mood) => {
    const selected = moodOptions.find(m => m.value === mood);
    setFormData({
      ...formData,
      mood: selected.value,
      moodEmoji: selected.emoji
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleGratitudeChange = (index, value) => {
    const newGratitude = [...formData.gratitude];
    newGratitude[index] = value;
    setFormData({
      ...formData,
      gratitude: newGratitude
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const entryData = {
        ...formData,
        gratitude: formData.gratitude.filter(g => g.trim() !== ''),
        date: new Date()
      };
      
      await axios.post(`${API_URL}/entries`, entryData);
      
      // Reset form
      setFormData({
        mood: 'happy',
        moodEmoji: '😊',
        title: '',
        content: '',
        gratitude: ['', '', ''],
        sleepHours: '',
        waterIntake: '',
        exercise: false,
        meditation: false
      });
      
      setShowForm(false);
      fetchEntries();
      fetchStats();
      
      alert('✨ Journal entry saved successfully!');
    } catch (error) {
      console.error('Error saving entry:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`❌ Error saving entry:\n${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`${API_URL}/entries/${id}`);
        fetchEntries();
        fetchStats();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const getMoodCount = (mood) => {
    if (!stats.moods) return 0;
    const moodStat = stats.moods.find(m => m._id === mood);
    return moodStat ? moodStat.count : 0;
  };

  return (
    <div className="app">
      <div className="header">
        <h1>✨ Mood & Wellness Journal ✨</h1>
        <p>Track your emotions, reflect, and grow 🌸</p>
      </div>

      <div className="container">
        {/* Stats Dashboard */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{entries.length}</div>
            <div className="stat-label">Total Entries</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats.wellness?.avgSleep ? Math.round(stats.wellness.avgSleep * 10) / 10 : 0}h
            </div>
            <div className="stat-label">Avg Sleep</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats.wellness?.exerciseDays || 0}
            </div>
            <div className="stat-label">Exercise Days</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats.wellness?.meditationDays || 0}
            </div>
            <div className="stat-label">Meditation Days</div>
          </div>
        </div>

        <div className="main-layout">
          {/* Sidebar - New Entry Form */}
          <div className="sidebar">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📝 New Entry</h2>
              </div>
              
              {!showForm ? (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => setShowForm(true)}
                >
                  ✨ Create Entry
                </button>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">How are you feeling?</label>
                    <div className="mood-selector">
                      {moodOptions.map((mood) => (
                        <div
                          key={mood.value}
                          className={`mood-option ${formData.mood === mood.value ? 'active' : ''}`}
                          onClick={() => handleMoodSelect(mood.value)}
                        >
                          <span className="mood-emoji">{mood.emoji}</span>
                          <span className="mood-label">{mood.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-input"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Give your day a title..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Journal Entry</label>
                    <textarea
                      name="content"
                      className="form-textarea"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="What's on your mind today?..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">💖 Gratitude (3 things)</label>
                    {[0, 1, 2].map((index) => (
                      <input
                        key={index}
                        type="text"
                        className="form-input"
                        style={{ marginBottom: '10px' }}
                        value={formData.gratitude[index]}
                        onChange={(e) => handleGratitudeChange(index, e.target.value)}
                        placeholder={`I'm grateful for...`}
                      />
                    ))}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Wellness Tracking</label>
                    <div className="wellness-trackers">
                      <div className="tracker-item">
                        <span className="tracker-label">😴 Sleep (hours)</span>
                        <input
                          type="number"
                          name="sleepHours"
                          className="tracker-input"
                          value={formData.sleepHours}
                          onChange={handleInputChange}
                          min="0"
                          max="24"
                          step="0.5"
                        />
                      </div>
                      
                      <div className="tracker-item">
                        <span className="tracker-label">💧 Water (glasses)</span>
                        <input
                          type="number"
                          name="waterIntake"
                          className="tracker-input"
                          value={formData.waterIntake}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                      
                      <div className="tracker-item">
                        <span className="tracker-label">🏃‍♀️ Exercise</span>
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="exercise"
                            className="custom-checkbox"
                            checked={formData.exercise}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="tracker-item">
                        <span className="tracker-label">🧘‍♀️ Meditation</span>
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            name="meditation"
                            className="custom-checkbox"
                            checked={formData.meditation}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      💾 Save Entry
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Mood Distribution */}
            <div className="card">
              <h2 className="card-title">🎭 Mood Distribution</h2>
              <div className="wellness-trackers">
                {moodOptions.map((mood) => (
                  <div key={mood.value} className="tracker-item">
                    <span className="tracker-label">
                      {mood.emoji} {mood.label}
                    </span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary-purple)' }}>
                      {getMoodCount(mood.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Entries List */}
          <div>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📖 My Journal Entries</h2>
              </div>

              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                </div>
              ) : entries.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📝</div>
                  <div className="empty-state-text">
                    No entries yet. Start journaling to track your mood and wellness!
                  </div>
                </div>
              ) : (
                <div className="entries-grid">
                  {entries.map((entry) => (
                    <div key={entry._id} className="entry-card">
                      <div className="entry-header">
                        <div className="entry-mood">
                          <span>{entry.moodEmoji}</span>
                          <span style={{ 
                            fontSize: '1rem', 
                            textTransform: 'capitalize',
                            fontWeight: '600',
                            color: 'var(--primary-purple)'
                          }}>
                            {entry.mood}
                          </span>
                        </div>
                        <div className="entry-date">
                          {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      
                      <div className="entry-title">{entry.title}</div>
                      <div className="entry-content">{entry.content}</div>
                      
                      {entry.gratitude && entry.gratitude.length > 0 && (
                        <div style={{ marginTop: '15px' }}>
                          <strong style={{ color: 'var(--primary-pink)' }}>💖 Grateful for:</strong>
                          <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                            {entry.gratitude.map((item, index) => (
                              <li key={index} style={{ color: 'var(--text-secondary)' }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="entry-tags">
                        {entry.sleepHours && (
                          <span className="tag">😴 {entry.sleepHours}h sleep</span>
                        )}
                        {entry.waterIntake && (
                          <span className="tag">💧 {entry.waterIntake} glasses</span>
                        )}
                        {entry.exercise && (
                          <span className="tag">🏃‍♀️ Exercised</span>
                        )}
                        {entry.meditation && (
                          <span className="tag">🧘‍♀️ Meditated</span>
                        )}
                      </div>
                      
                      <div className="entry-actions">
                        <button 
                          className="btn btn-small btn-delete"
                          onClick={() => handleDelete(entry._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;