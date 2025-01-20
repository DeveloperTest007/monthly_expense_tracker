import { useState } from 'react';
import { FiDollarSign, FiPlusCircle, FiMinusCircle } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import Spinner from '../components/Spinner';
import { useNavigate } from 'react-router-dom';

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

const IncomeAndExpense = () => {
  const { user } = useAuth();
  const { addTransaction } = useTransactions(user?.uid);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('income');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to add transactions');
      return;
    }

    try {
      setSubmitting(true);
      await addTransaction({
        ...formData,
        type: activeTab,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      });

      // Show success message
      alert(`${activeTab === 'income' ? 'Income' : 'Expense'} added successfully!`);
      
      // Navigate back to home page
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 gap-1 bg-gray-50">
          <button
            onClick={() => setActiveTab('income')}
            className={`p-4 rounded-xl flex items-center justify-center gap-2 transition-all
              ${activeTab === 'income'
                ? 'bg-white text-green-600 shadow-sm'
                : 'hover:bg-white/50 text-gray-600'
              }`}
          >
            <FiPlusCircle className={activeTab === 'income' ? 'animate-bounce' : ''} />
            Income
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`p-4 rounded-xl flex items-center justify-center gap-2 transition-all
              ${activeTab === 'expense'
                ? 'bg-white text-red-600 shadow-sm'
                : 'hover:bg-white/50 text-gray-600'
              }`}
          >
            <FiMinusCircle className={activeTab === 'expense' ? 'animate-bounce' : ''} />
            Expense
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  {(activeTab === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full pl-10 border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3
                    ${activeTab === 'income'
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" color="white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {activeTab === 'income' ? <FiPlusCircle /> : <FiMinusCircle />}
                      <span>Add {activeTab === 'income' ? 'Income' : 'Expense'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncomeAndExpense;
