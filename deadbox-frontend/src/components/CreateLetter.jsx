import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { letters } from '../services/api';
import './CreateLetter.css';

const CreateLetter = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientEmail: '',
    triggerType: 'date',
    scheduledDate: '',
    inactivityDays: '30',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await letters.create(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create letter. Please try again.');
      console.error('Error creating letter:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-letter-container">
      <div className="create-letter-content">
        <h1>Create New Letter</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="letter-form">
          <div className="form-group">
            <label htmlFor="title">Letter Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a title for your letter"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              rows="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="recipientEmail">Recipient's Email</label>
            <input
              type="email"
              id="recipientEmail"
              name="recipientEmail"
              value={formData.recipientEmail}
              onChange={handleChange}
              placeholder="Enter recipient's email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="triggerType">Delivery Method</label>
            <select
              id="triggerType"
              name="triggerType"
              value={formData.triggerType}
              onChange={handleChange}
              required
            >
              <option value="date">Scheduled Date</option>
              <option value="inactivity">Account Inactivity</option>
            </select>
          </div>

          {formData.triggerType === 'date' ? (
            <div className="form-group">
              <label htmlFor="scheduledDate">Scheduled Date</label>
              <input
                type="date"
                id="scheduledDate"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="inactivityDays">Days of Inactivity</label>
              <input
                type="number"
                id="inactivityDays"
                name="inactivityDays"
                value={formData.inactivityDays}
                onChange={handleChange}
                min="1"
                max="365"
                required
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Letter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLetter; 