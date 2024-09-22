// components/TradeList.js

import TradeItem from './TradeItem';

export default function TradeList({ trades, type }) {
  // Determine if the trades are negative
  const isNegative = type === 'Negative Trades';

    // Sort trades accordingly
    const sortedTrades = trades.sort((a, b) => {
    const aLatestTxn = getLatestTransaction(a);
    const bLatestTxn = getLatestTransaction(b);
  
    const aPnlValue = aLatestTxn.pnlValue;
    const bPnlValue = bLatestTxn.pnlValue;
  
    if (isNegative) {
      // Sort negative trades from worst to least loss
      return aPnlValue - bPnlValue;
    } else {
      // Sort positive trades from highest to lowest gain
      return bPnlValue - aPnlValue;
    }
  });
  

  function getLatestTransaction(trade) {
    return trade.transactions.reduce((latest, txn) =>
      new Date(txn.date) > new Date(latest.date) ? txn : latest
    );
  }

  return (
    <div className="trade-list">
      <h4>{type}</h4>
      {sortedTrades.map((trade, idx) => (
        <TradeItem key={idx} trade={trade} />
      ))}

      <style jsx>{`
        .trade-list {
          width: 48%;
          display: flex;
          flex-direction: column;
          overflow: auto;
        }
        h4 {
          color: #fff;
        }
      `}</style>
    </div>
  );
}
