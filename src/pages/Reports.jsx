import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Spinner from '../components/Spinner';
import { FiPieChart, FiTrendingUp, FiDollarSign, FiClock, FiChevronDown, FiChevronUp, FiCalendar, FiTag, FiInfo, FiPlusCircle, FiMinusCircle } from 'react-icons/fi';
import { formatDate, groupTransactionsByDate } from '../utils/dateUtils';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Reports = () => {
  // Add dateRangeOptions constant at the top of the component
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: 'year', label: 'Last Year' },
  ];

  const { user } = useAuth();
  const { transactions, loading, error } = useTransactions(user?.uid);
  const [timeframe, setTimeframe] = useState('month'); // 'month' or 'year'
  const [chartData, setChartData] = useState({
    categoryData: { labels: [], datasets: [] },
    trendData: { labels: [], datasets: [] },
    balanceData: { labels: [], datasets: [] },
  });
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [transactionFilters, setTransactionFilters] = useState({
    searchQuery: '',
    dateRange: 'all', // 'all', 'week', 'month', '3months'
    sortBy: 'date', // 'date', 'amount'
    sortOrder: 'desc' // 'asc', 'desc'
  });

  // Common chart options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    },
    animation: {
      duration: 2000
    }
  };

  // Line chart specific options
  const lineChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
    plugins: {
      ...commonChartOptions.plugins,
      tooltip: {
        mode: 'index',
        intersect: false,
        padding: 10,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: $${value.toLocaleString()}`;
          },
        },
      },
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  // Bar chart specific options
  const barChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  useEffect(() => {
    if (!transactions.length) return;

    // Process transactions for charts
    const processTransactions = () => {
      // Category breakdown
      const categoryTotals = transactions.reduce((acc, trans) => {
        if (trans.type === 'expense') {
          acc[trans.category] = (acc[trans.category] || 0) + Number(trans.amount);
        }
        return acc;
      }, {});

      // Monthly trends
      const monthlyData = transactions.reduce((acc, trans) => {
        const date = new Date(trans.date);
        const month = date.toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { 
            income: 0, 
            expenses: 0,
            savings: 0,
            savingsRate: 0 
          };
        }
        if (trans.type === 'income') {
          acc[month].income += Number(trans.amount);
        } else {
          acc[month].expenses += Number(trans.amount);
        }
        acc[month].savings = acc[month].income - acc[month].expenses;
        acc[month].savingsRate = acc[month].income > 0 
          ? (acc[month].savings / acc[month].income) * 100 
          : 0;
        return acc;
      }, {});

      // Update chart data
      setChartData({
        categoryData: {
          labels: Object.keys(categoryTotals),
          datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#FF6384',
              '#36A2EB',
            ],
          }],
        },
        trendData: {
          labels: Object.keys(monthlyData),
          datasets: [
            {
              label: 'Income',
              data: Object.values(monthlyData).map(d => d.income),
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Expenses',
              data: Object.values(monthlyData).map(d => d.expenses),
              borderColor: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Savings',
              data: Object.values(monthlyData).map(d => d.savings),
              borderColor: '#6366F1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              hidden: true,
            },
          ],
        },
        balanceData: {
          labels: Object.keys(monthlyData),
          datasets: [{
            label: 'Monthly Balance',
            data: Object.values(monthlyData).map(d => d.income - d.expenses),
            backgroundColor: (context) => {
              const value = context.raw;
              return value >= 0 ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)';
            },
          }],
        },
      });
    };

    processTransactions();
  }, [transactions, timeframe]);

  const toggleTransaction = (transactionId) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [transactionId]: !prev[transactionId]
    }));
  };

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

  // Get filtered and paginated transactions
  const filteredTransactions = transactions;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add pagination controls component
  const PaginationControls = () => (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages || 1}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0}
        className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  // Add filter and sort functions
  const filterAndSortTransactions = (transactions) => {
    return transactions
      .filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(transactionFilters.searchQuery.toLowerCase()) ||
                            transaction.category.toLowerCase().includes(transactionFilters.searchQuery.toLowerCase());
        
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        let dateMatch = true;

        switch (transactionFilters.dateRange) {
          case 'week':
            const weekAgo = new Date(today.setDate(today.getDate() - 7));
            dateMatch = transactionDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
            dateMatch = transactionDate >= monthAgo;
            break;
          case '3months':
            const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3));
            dateMatch = transactionDate >= threeMonthsAgo;
            break;
          default:
            dateMatch = true;
        }

        return matchesSearch && dateMatch;
      })
      .sort((a, b) => {
        const multiplier = transactionFilters.sortOrder === 'desc' ? -1 : 1;
        if (transactionFilters.sortBy === 'date') {
          return multiplier * (new Date(b.date) - new Date(a.date));
        }
        return multiplier * (Number(b.amount) - Number(a.amount));
      });
  };

  // Add TransactionFilters component
  const TransactionFilters = () => (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search transactions..."
          value={transactionFilters.searchQuery}
          onChange={(e) => setTransactionFilters(prev => ({
            ...prev,
            searchQuery: e.target.value
          }))}
          className="flex-1 min-w-[200px] rounded-lg border-gray-200 border-2 p-2 text-sm focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={transactionFilters.dateRange}
          onChange={(e) => setTransactionFilters(prev => ({
            ...prev,
            dateRange: e.target.value
          }))}
          className="rounded-lg border-gray-200 border-2 p-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="3months">Last 3 Months</option>
        </select>

        <select
          value={transactionFilters.sortBy}
          onChange={(e) => setTransactionFilters(prev => ({
            ...prev,
            sortBy: e.target.value
          }))}
          className="rounded-lg border-gray-200 border-2 p-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>

        <button
          onClick={() => setTransactionFilters(prev => ({
            ...prev,
            sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc'
          }))}
          className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm flex items-center gap-1"
        >
          {transactionFilters.sortOrder === 'desc' ? '↓' : '↑'}
        </button>
      </div>
    </div>
  );

  // Update loading state UI
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner size="lg" color="blue" />
      </div>
    );
  }

  // Update unauthorized state UI
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <p className="text-gray-600">Please sign in to view reports</p>
        </div>
      </div>
    );
  }

  // Update main return with modern background styling
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Financial Reports & Analytics
          </h1>
        </div>

        {error ? (
          <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-red-600">
            <p className="flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <p className="text-gray-600">No transaction data available</p>
            <p className="text-sm text-gray-400 mt-2">Add some transactions to see your financial reports</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-violet-500 to-purple-500">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <FiPieChart className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Total Categories</p>
                      <p className="text-white text-xl font-bold">
                        {chartData.categoryData.labels.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Add similar cards for other metrics */}
              {/* ...existing chart sections with updated styling... */}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Expense Categories Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FiPieChart className="text-blue-500 text-xl" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Expense Categories
                    </h2>
                  </div>
                </div>
                <div className="h-[300px] relative">
                  <Doughnut
                    data={chartData.categoryData}
                    options={commonChartOptions}
                  />
                </div>
              </div>

              {/* Income vs Expenses Trend Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                {/* Similar header structure for consistency */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <FiTrendingUp className="text-green-500 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        Income vs Expenses
                      </h2>
                      <p className="text-sm text-gray-500">Monthly comparison</p>
                    </div>
                  </div>
                </div>
                <div className="h-[300px] relative">
                  <Line 
                    data={chartData.trendData} 
                    options={lineChartOptions}
                    className="transition-all duration-500"
                  />
                </div>
              </div>

              {/* Monthly Balance Card - Full Width */}
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all md:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <FiDollarSign className="text-indigo-500 text-xl" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Monthly Balance
                    </h2>
                  </div>
                </div>
                <div className="h-[300px] relative">
                  <Bar data={chartData.balanceData} options={barChartOptions} />
                </div>
              </div>
            </div>

            <div className="mt-8">
              {/* Recent Transactions Section */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
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

                <div className={`transition-all duration-300 ${
                  isTransactionsOpen ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                } overflow-auto`}>
                  {loading ? (
                    <Spinner />
                  ) : (
                    <>
                      <TransactionFilters />
                      {paginatedTransactions.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                          No transactions match your filters
                        </p>
                      ) : (
                        <>
                          <div className="space-y-4">
                            {groupTransactionsByDate(
                              filterAndSortTransactions(paginatedTransactions)
                            ).map(({ date, transactions: groupedTransactions }) => (
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
                            ))}
                          </div>
                          <PaginationControls />
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
