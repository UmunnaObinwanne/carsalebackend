import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;
