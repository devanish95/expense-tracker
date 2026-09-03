const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  try {
    const { type, category } = req.query;

    const query = {
      user: req.user._id
    };

    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      query.type = type.toLowerCase();
    }

    if (
      category &&
      category.trim() !== '' &&
      category.toLowerCase() !== 'all'
    ) {
      query.category = category.trim();
    }

    const transactions = await Transaction.find(query).sort({
      date: -1,
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching transactions'
    });
  }
};

const addTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      category,
      description,
      date
    } = req.body;

    if (!type || !amount || !category || !description) {
      return res.status(400).json({
        success: false,
        message:
          'Please fill in all required fields (type, amount, category, description)'
      });
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0'
      });
    }

    if (!['income', 'expense'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "income" or "expense"'
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type: type.toLowerCase(),
      amount: parsedAmount,
      category: category.trim(),
      description: description.trim(),
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while adding transaction'
    });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      amount,
      category,
      description,
      date
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format'
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (
      transaction.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Forbidden: You do not have permission to modify this transaction'
      });
    }

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      transaction.amount = parsedAmount;
    }

    if (type !== undefined) {
      if (!['income', 'expense'].includes(type.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "income" or "expense"'
        });
      }

      transaction.type = type.toLowerCase();
    }

    if (category) {
      transaction.category = category.trim();
    }

    if (description) {
      transaction.description = description.trim();
    }

    if (date) {
      transaction.date = new Date(date);
    }

    const updatedTransaction = await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating transaction'
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID format'
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (
      transaction.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          'Forbidden: You do not have permission to delete this transaction'
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting transaction'
    });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
};
