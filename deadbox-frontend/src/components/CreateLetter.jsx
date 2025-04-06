import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';
import LoadingSpinner from './LoadingSpinner';
import './CreateLetter.css';

const CreateLetter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    triggerType: 'date',
    scheduledDate: '',
    inactivityDays: '',
    attachment: null
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment') {
      setFormData(prev => ({
        ...prev,
        attachment: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMessageChange = (content) => {
    setFormData(prev => ({
      ...prev,
      message: content
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create letter');
      }

      toast.success('Letter created successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="create-letter-container">
      <div className="create-letter-header">
        <h1>Create New Letter</h1>
      </div>
      <form className="create-letter-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <RichTextEditor
            content={formData.message}
            onChange={handleMessageChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="attachment">Attachment</label>
          <input
            type="file"
            id="attachment"
            name="attachment"
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.pdf,.doc,.docx"
          />
          <small className="file-info">
            Supported formats: Images, Videos, PDF, and Documents (Max size: 10MB)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="triggerType">Delivery Method</label>
          <select
            id="triggerType"
            name="triggerType"
            value={formData.triggerType}
            onChange={handleInputChange}
            required
          >
            <option value="date">Scheduled Date</option>
            <option value="inactivity">Inactivity Period</option>
          </select>
        </div>

        {formData.triggerType === 'date' ? (
          <div className="form-group">
            <label htmlFor="scheduledDate">Scheduled Date</label>
            <input
              type="datetime-local"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().slice(0, 16)}
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
              onChange={handleInputChange}
              required
              min="1"
            />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Create Letter
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLetter; 