const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// All transaction routes are protected by JWT authentication
router.use(protect);

// GET /api/transactions & POST /api/transactions
router.route('/')
  .get(getTransactions)
  .post(addTransaction);

// PUT /api/transactions/:id & DELETE /api/transactions/:id
router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;

