const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'anishsah546@gmail.com';
    const newPassword = 'Anishsah1234';

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('Password reset successfully');
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();