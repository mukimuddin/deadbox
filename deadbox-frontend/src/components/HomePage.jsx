import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to Deadbox</h1>
        <p className="tagline">Your digital time capsule for future messages</p>
        
        <div className="features">
          <div className="feature-item">
            <h3>🔒 Secure Storage</h3>
            <p>Keep your messages safe and encrypted until the right time</p>
          </div>
          <div className="feature-item">
            <h3>⏰ Time-Based Delivery</h3>
            <p>Schedule messages to be delivered at specific dates</p>
          </div>
          <div className="feature-item">
            <h3>👥 Family Access</h3>
            <p>Give your loved ones access to your messages when the time comes</p>
          </div>
        </div>

        <div className="auth-buttons">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 