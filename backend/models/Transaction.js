const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // Associate each transaction with the specific user who created it
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Transaction type must be either income or expense'
      },
      required: [true, 'Please specify if this is an income or expense']
    },
    amount: {
      type: Number,
      required: [true, 'Please enter an amount'],
      min: [0.01, 'Amount must be greater than 0']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a brief description'],
      trim: true,
      maxlength: [100, 'Description cannot exceed 100 characters']
    },
    date: {
      type: Date,
      required: [true, 'Please provide a transaction date'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);

