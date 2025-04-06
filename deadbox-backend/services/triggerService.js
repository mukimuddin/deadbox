const User = require('../models/User');
const Letter = require('../models/Letter');
const { sendEmail } = require('./email');

// Check for user inactivity
const checkInactivity = async () => {
  try {
    const users = await User.find({});
    const now = new Date();
    
    for (const user of users) {
      if (user.lastActivity) {
        const daysSinceLastActivity = Math.floor((now - user.lastActivity) / (1000 * 60 * 60 * 24));
        
        // Check for letters that should be sent due to inactivity
        const letters = await Letter.find({
          userId: user._id,
          triggerType: 'inactivity',
          isSent: false,
          inactivityDays: { $lte: daysSinceLastActivity }
        });
        
        for (const letter of letters) {
          await sendEmail({
            to: user.familyEmail,
            subject: `Deadbox Letter: ${letter.title}`,
            html: `
              <h2>${letter.title}</h2>
              <p>${letter.message}</p>
              ${letter.videoLink ? `<p>Video Link: ${letter.videoLink}</p>` : ''}
            `
          });
          
          letter.isSent = true;
          letter.sentDate = now;
          await letter.save();
        }
      }
    }
  } catch (error) {
    console.error('Error checking inactivity:', error);
  }
};

// Check for scheduled deliveries
const checkScheduledDeliveries = async () => {
  try {
    const now = new Date();
    const letters = await Letter.find({
      triggerType: 'date',
      isSent: false,
      scheduledDate: { $lte: now }
    });
    
    for (const letter of letters) {
      const user = await User.findById(letter.userId);
      if (user) {
        await sendEmail({
          to: user.familyEmail,
          subject: `Deadbox Letter: ${letter.title}`,
          html: `
            <h2>${letter.title}</h2>
            <p>${letter.message}</p>
            ${letter.videoLink ? `<p>Video Link: ${letter.videoLink}</p>` : ''}
          `
        });
        
        letter.isSent = true;
        letter.sentDate = now;
        await letter.save();
      }
    }
  } catch (error) {
    console.error('Error checking scheduled deliveries:', error);
  }
};

module.exports = {
  checkInactivity,
  checkScheduledDeliveries
}; 