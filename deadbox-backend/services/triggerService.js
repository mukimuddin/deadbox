const Letter = require('../models/Letter');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

// Check for letters that should be sent based on inactivity
const checkInactivity = async () => {
  try {
    const letters = await Letter.find({
      triggerType: 'inactivity',
      isSent: false,
      isUnlocked: false
    }).populate('userId');

    for (const letter of letters) {
      const user = letter.userId;
      const lastActivity = user.lastActivity || user.updatedAt;
      const inactivityDays = letter.inactivityDays;
      const inactivityThreshold = new Date();
      inactivityThreshold.setDate(inactivityThreshold.getDate() - inactivityDays);

      if (lastActivity < inactivityThreshold) {
        // Send email to family member
        await sendEmail({
          to: user.familyEmail,
          subject: 'A Letter Has Been Released',
          html: `
            <h1>A Letter Has Been Released</h1>
            <p>Due to ${user.name}'s inactivity for ${inactivityDays} days, a letter has been released.</p>
            <p>To read the letter, please visit the following link:</p>
            <a href="${process.env.FRONTEND_URL}/letters/${letter._id}/unlock">Read Letter</a>
          `
        });

        letter.isSent = true;
        letter.sentDate = new Date();
        await letter.save();
      }
    }
  } catch (error) {
    console.error('Error checking inactivity:', error);
  }
};

// Check for scheduled letters that should be sent
const checkScheduledDeliveries = async () => {
  try {
    const letters = await Letter.find({
      triggerType: 'date',
      isSent: false,
      isUnlocked: false,
      scheduledDate: { $lte: new Date() }
    }).populate('userId');

    for (const letter of letters) {
      const user = letter.userId;

      // Send email to family member
      await sendEmail({
        to: user.familyEmail,
        subject: 'A Scheduled Letter Has Been Released',
        html: `
          <h1>A Scheduled Letter Has Been Released</h1>
          <p>A letter from ${user.name} has been released as scheduled.</p>
          <p>To read the letter, please visit the following link:</p>
          <a href="${process.env.FRONTEND_URL}/letters/${letter._id}/unlock">Read Letter</a>
        `
      });

      letter.isSent = true;
      letter.sentDate = new Date();
      await letter.save();
    }
  } catch (error) {
    console.error('Error checking scheduled deliveries:', error);
  }
};

module.exports = {
  checkInactivity,
  checkScheduledDeliveries
}; 