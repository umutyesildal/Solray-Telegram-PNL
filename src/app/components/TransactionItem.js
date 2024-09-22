// components/TransactionItem.js

// In TransactionItem.js
export default function TransactionItem({ transaction, isOlder }) {
    const pnlColor = transaction.pnlValue >= 0 ? 'green' : 'red';
    const holdsAmount = extractHoldsAmount(transaction.holds);
    const holdsColor = holdsAmount > 0 ? 'orange' : 'gray';
  
    return (
      <div className={`transaction-item ${isOlder ? 'older' : ''}`}>
        <p style={{ color: pnlColor }}>
          PnL: {transaction.pnlValue.toFixed(2)} SOL ({transaction.pnlPercentage || 'N/A'})
        </p>
        <p style={{ color: holdsColor }}>Holds: {transaction.holds || 'None'}</p>
        <p>Market Cap: {transaction.mc || 'N/A'}</p>
        <p>Date: {new Date(transaction.date).toLocaleString()}</p>
  
        <style jsx>{`
          .transaction-item {
            margin-left: 10px;
            padding-left: 10px;
            border-left: 2px solid #444;
            margin-top: 10px;
          }
          .transaction-item p {
            margin: 5px 0; /* Increased vertical spacing */
            color: #ddd;
          }
        `}</style>
      </div>
    );
  }

  function extractHoldsAmount(holdsText) {
    if (!holdsText || holdsText.toLowerCase() === 'none') {
      return 0;
    }
    const match = holdsText.match(/([\d,.]+)/);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return 0;
  }
  