import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function App() {
  // Categories
  const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gifts'];
  const expenseCategories = ['Food', 'Rent', 'Transport', 'Entertainment'];

  // State
  const [balance, setBalance] = useState(1000);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(expenseCategories[0]);
  const [error, setError] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [budgets] = useState({
    Food: 500,
    Rent: 1500,
    Transport: 300,
    Entertainment: 200
  });

  // Add transaction
  const addTransaction = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (type === 'expense' && numAmount > balance) {
      setError(`Insufficient balance! Your balance is $${balance.toFixed(2)}`);
      return;
    }

    const newTransaction = {
      id: Date.now(),
      amount: numAmount,
      category,
      type,
      date: new Date().toLocaleString()
    };

    setTransactions([...transactions, newTransaction]);
    setBalance(type === 'income' ? balance + numAmount : balance - numAmount);
    setAmount('');
    setError('');
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    const t = transactions.find(t => t.id === id);
    setBalance(t.type === 'income' ? balance - t.amount : balance + t.amount);
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Filter transactions by month
  const filteredTransactions = monthFilter === 'all' 
    ? transactions 
    : transactions.filter(t => new Date(t.date).getMonth() === parseInt(monthFilter));

  // Prepare chart data
  const getChartData = (transactionType) => {
    const filtered = filteredTransactions.filter(t => t.type === transactionType);
    const categories = transactionType === 'income' ? incomeCategories : expenseCategories;
    
    const data = categories.map(cat => 
      filtered.reduce((sum, t) => t.category === cat ? sum + t.amount : sum, 0)
    );

    return {
      labels: categories,
      datasets: [{
        data: data,
        backgroundColor: transactionType === 'income' 
          ? ['#3a86ff', '#4361ee', '#4895ef', '#4cc9f0']
          : ['#f72585', '#b5179e', '#7209b7', '#560bad'],
        borderWidth: 1
      }]
    };
  };

  // Calculate budget status
  const getBudgetStatus = () => {
    return expenseCategories.map(cat => {
      const spent = filteredTransactions
        .filter(t => t.category === cat && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const remaining = budgets[cat] - spent;
      return { category: cat, remaining };
    });
  };

  return (
    <div className="app">
      <h1>Expense Tracker</h1>
      <div className="balance">Balance: ${balance.toFixed(2)}</div>

      {/* Transaction Form */}
      <div className="transaction-form">
        <div className="form-row">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="type-toggle">
            <button
              className={type === 'income' ? 'active' : ''}
              onClick={() => {
                setType('income');
                setCategory(incomeCategories[0]);
              }}
            >
              Income
            </button>
            <button
              className={type === 'expense' ? 'active' : ''}
              onClick={() => {
                setType('expense');
                setCategory(expenseCategories[0]);
              }}
            >
              Expense
            </button>
          </div>
          <button className="add-btn" onClick={addTransaction}>
            Add
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      {/* Dashboard */}
      <div className="dashboard">
        {/* Income Chart */}
        <div className="chart-container">
          <h3>Income</h3>
          <Pie data={getChartData('income')} />
        </div>

        {/* Main Panel */}
        <div className="main-panel">
          <div className="month-filter">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="all">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Status */}
          <div className="budget-status">
            <h3>Budget Status</h3>
            {getBudgetStatus().map(({ category, remaining }) => (
              <div key={category} className="budget-item">
                <span>{category}:</span>
                <span className={remaining >= 0 ? 'under' : 'over'}>
                  ${Math.abs(remaining).toFixed(2)} {remaining >= 0 ? 'left' : 'over'}
                </span>
              </div>
            ))}
          </div>

          {/* Transaction History */}
          <div className="transaction-history">
            <h3>Transactions</h3>
            {filteredTransactions.length === 0 ? (
              <p>No transactions yet</p>
            ) : (
              <ul>
                {filteredTransactions.map(t => (
                  <li key={t.id} className={t.type}>
                    <span className="date">{t.date}</span>
                    <span className="category">{t.category}</span>
                    <span className="amount">
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </span>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteTransaction(t.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Expense Chart */}
        <div className="chart-container">
          <h3>Expenses</h3>
          <Pie data={getChartData('expense')} />
        </div>
      </div>
    </div>
  );
}