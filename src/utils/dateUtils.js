export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const groupTransactionsByDate = (transactions) => {
  const groups = transactions.reduce((groups, transaction) => {
    const date = transaction.date.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  // Convert to array and sort by date
  return Object.entries(groups)
    .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
    .map(([date, transactions]) => ({
      date,
      transactions
    }));
};
