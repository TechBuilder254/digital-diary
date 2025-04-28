import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MoodTracker = () => {
  const [mood, setMood] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);

  // Fetch mood history from the backend
  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/moods');
      setMoodHistory(response.data);
    } catch (error) {
      console.error('Error fetching mood history:', error);
      alert('Failed to fetch mood history. Please try again later.');
    }
  };

  const handleMoodSubmit = async () => {
    if (!mood) {
      alert('Please select a mood!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/moods', {
        mood,
        date: new Date().toISOString(),
      });
      setMoodHistory((prevHistory) => [...prevHistory, response.data]);
      setMood('');
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Failed to save mood. Please try again.');
    }
  };

  return (
    <div className="mood-tracker-container">
      <h2 className="mood-tracker-header">Mood Tracker</h2>
      <div className="mood-selection">
        <label className="mood-label">
          😊 Happy
          <input
            type="radio"
            name="mood"
            value="Happy"
            onChange={(e) => setMood(e.target.value)}
          />
        </label>
        <label className="mood-label">
          😔 Sad
          <input
            type="radio"
            name="mood"
            value="Sad"
            onChange={(e) => setMood(e.target.value)}
          />
        </label>
        <label className="mood-label">
          😡 Angry
          <input
            type="radio"
            name="mood"
            value="Angry"
            onChange={(e) => setMood(e.target.value)}
          />
        </label>
      </div>
      <button className="save-mood-btn" onClick={handleMoodSubmit}>
        Save Mood
      </button>

      <h3 className="mood-history-header">Mood History</h3>
      <ul className="mood-history-list">
        {moodHistory.map((entry, index) => (
          <li key={index}>
            {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString()}: {entry.mood}
          </li>
        ))}
      </ul>

      {/* Inline CSS */}
      <style jsx>{`
        .mood-tracker-container {
          font-family: 'Arial', sans-serif;
          padding: 20px;
          max-width: 500px;
          margin: 0 auto;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .mood-tracker-header {
          text-align: center;
          font-size: 2rem;
          color: #333;
        }
        .mood-selection {
          display: flex;
          justify-content: space-around;
          margin: 20px 0;
        }
        .mood-label {
          font-size: 1.2rem;
        }
        .save-mood-btn {
          width: 100%;
          padding: 10px;
          font-size: 1.2rem;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .save-mood-btn:hover {
          background-color: #45a049;
        }
        .mood-history-header {
          font-size: 1.5rem;
          margin-top: 20px;
        }
        .mood-history-list {
          list-style-type: none;
          padding: 0;
        }
        .mood-history-list li {
          font-size: 1rem;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
};

export default MoodTracker;
