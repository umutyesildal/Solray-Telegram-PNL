// components/UserBox.js

import { useState } from 'react';
import TradeList from './TradeList';

export default function UserBox({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDetails = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="user-box"  >
      <div className="user-summary" onClick={toggleDetails} >
        <h3>{user.userName || 'N/A'}</h3>
        <p>User Address: {user.userAddress || 'N/A'}</p>
        <p>Total PnL: {user.total_pnl.toFixed(2)} SOL</p>
      </div>
      {isOpen && (
        <div className="user-details">
          <div className="columns">
            <TradeList trades={user.positive_trades} type="Positive Trades" />
            <TradeList trades={user.negative_trades} type="Negative Trades" />
          </div>
        </div>
      )}

      <style jsx>{`
        .user-box {
          background-color: #1e1e1e;
          border: 1px solid #444;
          margin: 20px 0; /* Increased vertical margin */
          width: 90%;
          cursor: pointer;
        }
      .user-summary {
        text-align: left;
        color: #fff;
        margin-bottom: 10px; /* Added margin */
        padding: 20px;
      }
      .user-details {
        margin-top: 15px;
        text-align: left;
        padding: 10px 0; /* Added vertical padding */
      }
      .columns {
        display: flex;
        justify-content: space-between;
        align-items: flex-start; /* Align items to the top */
      }
      .trade-list {
        width: 48%;
        display: flex;
        flex-direction: column;
      }
      `}</style>
    </div>
  );
}
