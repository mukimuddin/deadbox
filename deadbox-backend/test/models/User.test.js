const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      familyEmail: 'family@example.com',
      familyKey: 'test-key'
    };

    const user = new User(userData);
    await user.save();

    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
    expect(user.familyEmail).toBe(userData.familyEmail);
    expect(user.familyKey).toBe(userData.familyKey);
    expect(user.password).not.toBe(userData.password); // Password should be hashed
  });

  test('should not create user with duplicate email', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      familyEmail: 'family@example.com',
      familyKey: 'test-key'
    };

    await new User(userData).save();
    
    await expect(new User(userData).save()).rejects.toThrow();
  });

  test('should validate password correctly', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      familyEmail: 'family@example.com',
      familyKey: 'test-key'
    };

    const user = new User(userData);
    await user.save();

    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });
}); 