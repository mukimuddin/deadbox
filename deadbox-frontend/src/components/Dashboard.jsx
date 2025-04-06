import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { letters } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [userLetters, setUserLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const response = await letters.getAll();
        setUserLetters(response.data);
      } catch (err) {
        setError('Failed to load your letters. Please try again later.');
        console.error('Error fetching letters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your letters...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Letters</h1>
        <Link to="/create-letter" className="create-button">
          Create New Letter
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="letters-grid">
        {userLetters.length === 0 ? (
          <div className="no-letters">
            <h2>No Letters Yet</h2>
            <p>Start by creating your first letter to your loved ones.</p>
            <Link to="/create-letter" className="create-button">
              Create Your First Letter
            </Link>
          </div>
        ) : (
          userLetters.map(letter => (
            <div key={letter._id} className="letter-card">
              <div className="letter-content">
                <h3>{letter.title}</h3>
                <p className="letter-preview">
                  {letter.message.length > 100
                    ? `${letter.message.substring(0, 100)}...`
                    : letter.message}
                </p>
                <div className="letter-meta">
                  <span className="letter-date">
                    {letter.triggerType === 'date'
                      ? `Scheduled: ${new Date(letter.scheduledDate).toLocaleDateString()}`
                      : `Inactivity: ${letter.inactivityDays} days`}
                  </span>
                  <span className={`letter-status ${letter.isSent ? 'sent' : 'pending'}`}>
                    {letter.isSent ? 'Sent' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="letter-actions">
                <button className="edit-button">Edit</button>
                <button className="delete-button">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard; 