const User = require('../models/User');

const cleanupUnverifiedAccounts = async () => {
  try {
    const unverifiedUsers = await User.findUnverifiedOlderThan7Days();
    let deletedCount = 0;
    
    for (const user of unverifiedUsers) {
      try {
        await User.deleteOne({ _id: user._id });
        console.log(`Successfully deleted unverified user: ${user.email}`);
        deletedCount++;
      } catch (deleteError) {
        console.error(`Failed to delete user ${user.email}:`, deleteError);
      }
    }
    
    console.log(`Cleanup completed. Deleted ${deletedCount} out of ${unverifiedUsers.length} unverified accounts.`);
  } catch (error) {
    console.error('Error during cleanup:', error);
    // Don't throw the error, just log it to prevent server crash
  }
};

module.exports = {
  cleanupUnverifiedAccounts
}; 