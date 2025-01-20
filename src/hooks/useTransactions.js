import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';

export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [indexBuilding, setIndexBuilding] = useState(false);

  const fetchTransactions = async () => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIndexBuilding(false);

      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const fetchedTransactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        amount: parseFloat(doc.data().amount)
      }));

      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      if (error.code === 'failed-precondition' || error.message.includes('index')) {
        setIndexBuilding(true);
        setError('Setting up database... Please wait a moment and try again.');
      } else {
        setError('Failed to load transactions. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData) => {
    if (!userId) throw new Error('User must be logged in');

    const transactionsRef = collection(db, 'transactions');
    const newTransaction = {
      ...transactionData,
      userId,
      amount: parseFloat(transactionData.amount)
    };

    await addDoc(transactionsRef, newTransaction);
    await fetchTransactions();
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  return {
    transactions,
    loading,
    error,
    indexBuilding,
    fetchTransactions,
    addTransaction,
    calculateTotals
  };
};
