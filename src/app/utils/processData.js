// utils/processData.js

import axios from 'axios';

export default async function processData(jsonData, setProcessingStep, console) {
    console.log('Start processData');
    setProcessingStep('Finding PnL...');
    const messages = jsonData.messages;
    console.log('Total messages:', messages.length);
  
    // Extract SELL messages
    setProcessingStep('Filtering SELL messages...');
    const sellMessages = filterSellMessages(messages);
    console.log('Total SELL messages:', sellMessages.length);
  
    // Extract data from messages
    setProcessingStep('Extracting data from SELL messages...');
    const extractedData = extractDataFromMessages(sellMessages);
    console.log('Extracted data:', extractedData);
  
    // Filter out zero PnL transactions
    const filteredData = extractedData.filter((data) => data !== null && data.pnlValue !== 0);
  
    // Group data by user
    setProcessingStep('Grouping data by user and calculating total PnL...');
    const { userDataArray, startDate, endDate } = groupDataByUser(filteredData);
    console.log('Grouped and sorted user data:', userDataArray);

    // Send data to Discord
    setProcessingStep('Sending data to Discord webhook...');
    await sendDataToDiscord(userDataArray);
  
    return { userDataArray, startDate, endDate };
  }
  
  function filterSellMessages(messages) {
    return messages.filter((message) => {
      // Check if the message text contains "SELL"
      return message.text.some((textItem) => {
        if (typeof textItem === 'string') {
          return textItem.includes('SELL');
        } else if (textItem.type === 'text_link' || textItem.type === 'bold') {
          return textItem.text.includes('SELL');
        }
        return false;
      });
    });
  }
  
  function extractDataFromMessages(messages) {
    const excludedTokens = {
      addresses: [
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
        '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo', // PYUSD
      ],
      names: ['USDC', 'USDT', 'PYUSD'],
    };
  
    return messages.map((message) => {
      const data = extractDataFromMessage(message);
      // Exclude tokens as before
      if (
        excludedTokens.addresses.includes(data.tokenAddress) ||
        excludedTokens.names.includes(data.tokenName.toUpperCase())
      ) {
        return null;
      }
      return data;
    });
  }
  
  function extractDataFromMessage(message) {
    const textArray = message.text;
    let tokenName = '';
    let tokenAddress = '';
    let userName = '';
    let userAddress = '';
    let pnl = '';
    let pnlPercentage = '';
    let holds = '';
    let mc = '';
    let seen = '';
    let pnlValue = 0;
  
    // Variables to track indices
    let pnlIndex = -1;
    let holdsIndex = -1;
    let mcIndex = -1;
    let seenIndex = -1;
  
    // Parse the text array to extract required information
    textArray.forEach((item, index) => {
      let textContent = '';
  
      if (typeof item === 'object') {
        textContent = item.text;
      } else if (typeof item === 'string') {
        textContent = item;
      }
  
      // Token Name
      if (textContent.includes('SELL')) {
        tokenName = textContent.replace('SELL ', '').trim();
      }
  
      // Token Address
      if (
        typeof item === 'object' &&
        item.type === 'text_link' &&
        item.href.includes('solscan.io/token/')
      ) {
        tokenAddress = item.href.split('/').pop();
      }
  
      // User Name
      if (typeof item === 'object' && item.type === 'bold' && !userName) {
        userName = textContent;
      }
  
      // User Address
      if (typeof item === 'object' && item.type === 'code' && !userAddress) {
        userAddress = textContent;
      }
  
      // PnL Index
      if (textContent.includes('PnL:')) {
        pnlIndex = index;
      }
  
      // Holds Index
      if (textContent.includes('Holds:')) {
        holdsIndex = index;
      }
  
      // MC Index
      if (textContent.includes('MC')) {
        mcIndex = index;
      }
  
      // Seen Index
      if (textContent.includes('Seen:')) {
        seenIndex = index;
      }
    });
  
    // Extract PnL and PnL Percentage
    if (pnlIndex !== -1) {
      const pnlItem = textArray[pnlIndex + 1];
      let pnlText = '';
  
      if (typeof pnlItem === 'object') {
        pnlText = pnlItem.text;
      } else if (typeof pnlItem === 'string') {
        pnlText = pnlItem;
      }
  
      pnl = pnlText;
      // Extract numeric value from PnL
      const match = pnl.match(/([+-]?[\d,]+(\.\d+)?)/);
      if (match) {
        pnlValue = parseFloat(match[1].replace(/,/g, ''));
      }
  
      // Extract PnL Percentage
      const percentageItem = textArray[pnlIndex + 2]; // This should be the percentage string
      let percentageText = '';
  
      if (typeof percentageItem === 'object') {
        percentageText = percentageItem.text;
      } else if (typeof percentageItem === 'string') {
        percentageText = percentageItem;
      }
  
      const percentageMatch = percentageText.match(/([+-]?[\d,.]+)%/);
      if (percentageMatch) {
        pnlPercentage = percentageMatch[0]; // e.g., "+29.56%"
      }
    }
  
    // Extract Holds
    if (holdsIndex !== -1) {
      const holdsItem = textArray[holdsIndex];
      let holdsText = '';
  
      if (typeof holdsItem === 'object') {
        holdsText = holdsItem.text;
      } else if (typeof holdsItem === 'string') {
        holdsText = holdsItem;
      }
  
      // Extract holds value from the text
      const holdsMatch = holdsText.match(/Holds:\s*(.*)/);
      if (holdsMatch) {
        holds = holdsMatch[1].trim();
      } else {
        // Try the next item if not found
        const nextItem = textArray[holdsIndex + 1];
        if (nextItem) {
          holdsText = typeof nextItem === 'object' ? nextItem.text : nextItem;
          holds = holdsText.trim();
        }
      }
    }
  
    // If holds is still empty, set it to 'None'
    if (!holds) {
      holds = 'None';
    }
  
    // Extract MC
    if (mcIndex !== -1) {
      // Collect text from mcIndex to mcIndex + 2
      let mcText = '';
      for (let i = mcIndex; i <= mcIndex + 2 && i < textArray.length; i++) {
        const item = textArray[i];
        mcText += typeof item === 'object' ? item.text : item;
      }
  
      // Extract MC value from the text
      const mcMatch = mcText.match(/MC:\s*\$?([\d.,]+[KMB]?)/);
      if (mcMatch) {
        mc = mcMatch[1].trim();
      }
    }
  
    // If mc is still empty, set it to 'N/A'
    if (!mc) {
      mc = 'N/A';
    }
  
    // Extract Seen
    if (seenIndex !== -1) {
      // Collect text from seenIndex to seenIndex + 2
      let seenText = '';
      for (let i = seenIndex; i <= seenIndex + 2 && i < textArray.length; i++) {
        const item = textArray[i];
        seenText += typeof item === 'object' ? item.text : item;
      }
  
      // Extract Seen value from the text
      const seenMatch = seenText.match(/Seen:\s*([\d\w]+)/);
      if (seenMatch) {
        seen = seenMatch[1].trim();
      }
    }
  
    // If seen is still empty, set it to 'N/A'
    if (!seen) {
      seen = 'N/A';
    }
  
    return {
      tokenName,
      tokenAddress,
      userName,
      userAddress,
      pnl,
      pnlPercentage,
      pnlValue,
      holds,
      mc,
      seen,
      date: message.date,
    };
  }
  
  function groupDataByUser(filteredData) {
    const userGroup = {};
  
    filteredData.forEach((data) => {
      const userKey = data.userAddress;
  
      if (!userGroup[userKey]) {
        userGroup[userKey] = {
          userName: data.userName,
          userAddress: data.userAddress,
          total_pnl: 0,
          positive_trades: {},
          negative_trades: {},
          latest_transactions: {}, // To store the latest transaction per token
        };
      }
  
      // Create a transaction object
      const transaction = {
        ...data,
      };
  
      // Determine if the trade is positive or negative
      const tradeType = data.pnlValue > 0 ? 'positive_trades' : 'negative_trades';
  
      // Group trades by token within positive or negative trades
      if (!userGroup[userKey][tradeType][data.tokenAddress]) {
        userGroup[userKey][tradeType][data.tokenAddress] = {
          tokenName: data.tokenName,
          tokenAddress: data.tokenAddress,
          transactions: [],
        };
      }
  
      userGroup[userKey][tradeType][data.tokenAddress].transactions.push(transaction);
  
      // Update the latest transaction for the token
      const tokenKey = data.tokenAddress;
      if (
        !userGroup[userKey].latest_transactions[tokenKey] ||
        new Date(data.date) > new Date(userGroup[userKey].latest_transactions[tokenKey].date)
      ) {
        userGroup[userKey].latest_transactions[tokenKey] = transaction;
      }
    });
  
    // Calculate total_pnl using only the latest transactions per token
    Object.values(userGroup).forEach((user) => {
      user.total_pnl = 0; // Reset total_pnl
      Object.values(user.latest_transactions).forEach((txn) => {
        user.total_pnl += txn.pnlValue;
      });
  
      // Convert trades objects to arrays
      user.positive_trades = Object.values(user.positive_trades);
      user.negative_trades = Object.values(user.negative_trades);
    });
  
    // Convert userGroup to an array and sort by total_pnl descending
    const userDataArray = Object.values(userGroup).sort((a, b) => b.total_pnl - a.total_pnl);
  
    // Determine the overall start and end dates
    const allDates = filteredData.map((data) => new Date(data.date));
    const startDate = new Date(Math.min(...allDates));
    const endDate = new Date(Math.max(...allDates));
  
    return { userDataArray, startDate, endDate };
  }



const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1287484424572764222/ZX-FHIoA38xU9N0unuuvNHa2e_w_voTi7TLQugKl9ABH9iMVEbei9p2_8qV2nxXqOUuT'


async function sendDataToDiscord(userDataArray) {
    try {
      const timestamp = new Date().toISOString();
      const fileName = `ProcessedUserData_${timestamp}.json`;
  
      // Create a Blob from the userDataArray
      const jsonString = JSON.stringify(userDataArray, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
  
      // Create a FormData object and append the file and content
      const formData = new FormData();
      formData.append('file', blob, fileName);
      formData.append('content', `**Processed User Data as of ${timestamp}:**`);
  
      // Send the POST request to Discord webhook URL
      await axios.post(DISCORD_WEBHOOK_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Data file sent to Discord webhook successfully.');
    } catch (error) {
      console.error('Error sending data to Discord:', error);
    }
  }
  