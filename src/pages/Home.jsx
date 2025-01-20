// Import statements
import { useState, useEffect } from 'react';
import { FiDollarSign, FiPlusCircle, FiMinusCircle, FiClock, FiTag, FiChevronDown, FiChevronUp, FiCalendar, FiInfo } from 'react-icons/fi';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { formatDate, groupTransactionsByDate } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import { useTransactions } from '../hooks/useTransactions';
import { useNavigate, Link } from 'react-router-dom';

// Constants for categories
const incomeCategories = [
  'Salary',
  'Freelance',
  'Investments',
  'Business',
  'Other Income'
];

const expenseCategories = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Other'
];

const Home = () => {
  const { user, signInWithGoogle, logout, loading: authLoading, error: authError } = useAuth();
  const {
    transactions,
    loading,
    error,
    indexBuilding,
    addTransaction,
    calculateTotals
  } = useTransactions(user?.uid);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('');
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(true);
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to add transactions');
      return;
    }

    try {
      setSubmitting(true);
      await addTransaction({
        description,
        amount,
        type,
        category,
        date: new Date(selectedDate).toISOString()
      });

      // Reset form and UI state
      setIsFormOpen(false);
      setIsTransactionsOpen(true);
      setDescription('');
      setAmount('');
      setCategory('');
      setSelectedDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add missing handleSignIn function
  const handleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result) {
        navigate('/'); // Navigate to home page after successful sign in
      }
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  // Add missing toggleTransaction function if not already present
  const toggleTransaction = (transactionId) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [transactionId]: !prev[transactionId]
    }));
  };

  // Get calculated totals
  const { totalIncome, totalExpenses, balance } = calculateTotals();

  // Fix transaction rendering and error handling
  const renderTransaction = (transaction) => (
    <div
      key={transaction.id}
      className="border border-gray-100 rounded-xl hover:shadow-md transition-all bg-white overflow-hidden"
    >
      <div
        onClick={() => toggleTransaction(transaction.id)}
        className="flex justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {transaction.type === 'income' ?
            <FiPlusCircle className="text-green-500 text-lg sm:text-xl" /> :
            <FiMinusCircle className="text-red-500 text-lg sm:text-xl" />
          }
          <div>
            <span className="font-medium block text-sm sm:text-base">
              {transaction.description}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              <FiTag className="text-blue-400" />
              {transaction.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm sm:text-base ${
            transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
          }`}>
            ${transaction.amount.toFixed(2)}
          </span>
          {expandedTransactions[transaction.id] ? 
            <FiChevronUp className="text-gray-400" /> : 
            <FiChevronDown className="text-gray-400" />
          }
        </div>
      </div>
      
      {/* Collapsible Details */}
      <div className={`
        bg-gray-50 border-t border-gray-100 transition-all duration-200 overflow-hidden
        ${expandedTransactions[transaction.id] ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <FiInfo className="text-blue-400" />
            <span className="font-medium text-gray-700">Transaction Details</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(transaction.date).toLocaleString([], {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Category</p>
              <p className="text-sm font-medium text-gray-700">{transaction.category}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Type</p>
              <p className="text-sm font-medium text-gray-700 capitalize">{transaction.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
              <p className={`text-sm font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                ${transaction.amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Move the conditional render after all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spinner size="lg" color="blue" />
      </div>
    );
  }

  // Fix syntax error in JSX - remove extra closing div
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-3 sm:px-4">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" color="blue" />
              <p className="text-gray-600">Loading your transactions...</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Monthly Expense Tracker
          </h1>
          <div className="flex gap-4">
            {user && (
              <Link
                to="/add-transaction"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Add Transaction
              </Link>
            )}
            {!user && (
              <button
                onClick={handleSignIn}
                disabled={authLoading}
                className="px-4 py-2 bg-white rounded-lg shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            )}
            {authError && (
              <div className="mt-2 text-sm text-red-500">
                {authError}
              </div>
            )}
          </div>
        </div>

        {!user ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Please sign in to manage your transactions</p>
          </div>
        ) : (
          <>
            {/* Updated Summary Cards - Now with Balance */}
            <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-400 to-green-500 p-4 sm:p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm sm:text-base">Total Income</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">${totalIncome.toFixed(2)}</p>
                    </div>
                    <FiPlusCircle className="text-2xl sm:text-3xl text-green-100" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-400 to-red-500 p-4 sm:p-6 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm sm:text-base">Total Expenses</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">${totalExpenses.toFixed(2)}</p>
                    </div>
                    <FiMinusCircle className="text-2xl sm:text-3xl text-red-100" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-4 sm:p-6 rounded-2xl shadow-lg sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm sm:text-base">Cash Balance</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">
                        ${balance.toFixed(2)}
                      </p>
                    </div>
                    <div className={`text-2xl sm:text-3xl ${balance >= 0 ? 'text-blue-100' : 'text-red-300'}`}>
                      {balance >= 0 ? '💰' : '⚠️'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Add Balance Status Message */}
              <div className={`text-center text-sm ${
                balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {balance >= 0 
                  ? '👍 Your finances are in good shape!' 
                  : '⚠️ Warning: You are spending more than your income'}
              </div>
            </div>

            {/* Modified Main Content */}
            <div className="bg-white backdrop-blur-lg bg-opacity-60 p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl">
              {/* Collapsible Add Transaction Form */}
              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FiDollarSign className="text-blue-500" />
                  <span className="font-semibold text-gray-700">Add Transaction</span>
                </div>
                {isFormOpen ? 
                  <FiChevronUp className="text-gray-500" /> : 
                  <FiChevronDown className="text-gray-500" />
                }
              </button>

              <div className={`transition-all duration-300 overflow-hidden ${
                isFormOpen ? 'max-h-[500px] opacity-100 mt-6' : 'max-h-0 opacity-0'
              }`}>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Form fields with responsive padding and text size */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Type</label>
                      <select
                        value={type}
                        onChange={(e) => {
                          setType(e.target.value);
                          setCategory('');
                        }}
                        className="w-full border-2 border-gray-200 rounded-xl p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select a category</option>
                        {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Amount</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl p-2 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 sm:py-3 px-4 rounded-xl font-medium text-sm sm:text-base hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" color="white" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      'Add Transaction'
                    )}
                  </button>
                </form>
              </div>

              {/* Collapsible Recent Transactions */}
              <div className="mt-8">
                <button
                  onClick={() => setIsTransactionsOpen(!isTransactionsOpen)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FiClock className="text-blue-500" />
                    <span className="font-semibold text-gray-700">Recent Transactions</span>
                  </div>
                  {isTransactionsOpen ? 
                    <FiChevronUp className="text-gray-500" /> : 
                    <FiChevronDown className="text-gray-500" />
                  }
                </button>

                <div className={`mt-4 space-y-4 transition-all duration-300 ${
                  isTransactionsOpen ? 'max-h-[600px] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Spinner size="md" color="blue" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <p className="text-red-500">{error}</p>
                      {indexBuilding ? (
                        <p className="text-sm text-gray-500 mt-2">
                          First-time setup in progress. This may take a few minutes.
                        </p>
                      ) : null}
                    </div>
                  ) : transactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No transactions yet</p>
                  ) : (
                    groupTransactionsByDate(transactions).map(({ date, transactions: groupedTransactions }) => (
                      <div key={date} className="space-y-2">
                        <div className="flex items-center gap-2 py-2">
                          <FiCalendar className="text-blue-400" />
                          <h3 className="text-sm font-medium text-gray-600">
                            {formatDate(date)}
                          </h3>
                        </div>
                        <div className="space-y-2 pl-2">
                          {groupedTransactions.map(renderTransaction)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
