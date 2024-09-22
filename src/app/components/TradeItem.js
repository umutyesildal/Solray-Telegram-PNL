// components/TradeItem.js

import { useState } from 'react';
import TransactionItem from './TransactionItem';

export default function TradeItem({ trade }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const latestTransaction = trade.transactions.reduce((latest, txn) =>
    new Date(txn.date) > new Date(latest.date) ? txn : latest
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyMessage('Token address copied!');
    setTimeout(() => setCopyMessage(''), 2000);
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const shortenAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Filter out transactions with zero PnL
  const filteredTransactions = trade.transactions.filter((txn) => txn.pnlValue !== 0);
  const hasMultipleTransactions = filteredTransactions.length > 1;
  const olderTransactions = filteredTransactions
  .filter((txn) => txn !== latestTransaction)
  .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort descending by date

  return (
<div className="trade-item">
  <p>
    Token: {trade.tokenName || 'N/A'}{' '}
    <span
      className="token-address"
      onClick={(e) => {
        e.stopPropagation();
        copyToClipboard(trade.tokenAddress);
      }}
    >
      ({shortenAddress(trade.tokenAddress)})
    </span>
    {copyMessage && <span className="copy-message">{copyMessage}</span>}
  </p>
  <TransactionItem transaction={latestTransaction} />
  {hasMultipleTransactions && (
    <button className="expand-button" onClick={toggleExpansion}>
      {isExpanded ? 'Hide Older Transactions' : 'Show Older Transactions'}
    </button>
  )}
  {isExpanded &&
    olderTransactions.map((txn, idx) => (
      <TransactionItem key={idx} transaction={txn} isOlder={true} />
    ))}

      <style jsx>{`
    .trade-item {
      margin-bottom: 20px; /* Increased margin */
      padding: 15px; /* Increased padding */
      border: 1px solid #444;
      background-color: #2b2b2b;
    }
        .trade-item:hover {
            background-color: #3a3a3a;
        }
    .token-address {
      color: #1e90ff;
      cursor: pointer;
    }
    .token-address:hover {
      text-decoration: underline;
    }
    .copy-message {
      margin-left: 10px;
      color: green;
      font-size: 0.9em;
    }
    .expand-button {
      margin-top: 10px;
      background-color: #444;
      color: #fff;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
    }
    .expand-button:hover {
      background-color: #555;
    }
      `}</style>
    </div>
  );
}
