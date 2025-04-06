const mongoose = require('mongoose');
const User = require('../../models/User');
const Letter = require('../../models/Letter');

describe('Letter Model', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Letter.deleteMany({});

    user = new User({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      familyEmail: 'family@example.com',
      familyKey: 'test-key'
    });
    await user.save();
  });

  test('should create a new letter', async () => {
    const letterData = {
      userId: user._id,
      title: 'Test Letter',
      message: 'This is a test message',
      videoLink: 'https://example.com/video',
      triggerType: 'date',
      scheduledDate: new Date(Date.now() + 86400000) // Tomorrow
    };

    const letter = new Letter(letterData);
    await letter.save();

    expect(letter.title).toBe(letterData.title);
    expect(letter.message).toBe(letterData.message);
    expect(letter.videoLink).toBe(letterData.videoLink);
    expect(letter.triggerType).toBe(letterData.triggerType);
    expect(letter.scheduledDate).toEqual(letterData.scheduledDate);
    expect(letter.isDelivered).toBe(false);
    expect(letter.isUnlocked).toBe(false);
  });

  test('should create letter with inactivity trigger', async () => {
    const letterData = {
      userId: user._id,
      title: 'Test Letter',
      message: 'This is a test message',
      triggerType: 'inactivity',
      inactivityDays: 30
    };

    const letter = new Letter(letterData);
    await letter.save();

    expect(letter.triggerType).toBe('inactivity');
    expect(letter.inactivityDays).toBe(30);
    expect(letter.scheduledDate).toBeUndefined();
  });

  test('should not create letter without required fields', async () => {
    const letterData = {
      userId: user._id,
      // Missing title and message
      triggerType: 'date',
      scheduledDate: new Date()
    };

    await expect(new Letter(letterData).save()).rejects.toThrow();
  });
}); 