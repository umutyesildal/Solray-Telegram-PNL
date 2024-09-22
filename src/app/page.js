// pages/index.js
'use client'
import { useState } from 'react';
import { Source_Code_Pro } from 'next/font/google';
import Loader from '../app/components/Loader';
import UserBox from '../app/components/UserBox';
import processData from '../app/utils/processData';

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function Home() {
  const [isDataParsed, setIsDataParsed] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const handleFileRead = (file) => {
    console.log('Start handleFileRead');
    setProcessingStep('Parsing data...');
    const reader = new FileReader();
    reader.onload = (event) => {
      (async () => {
        try {
          console.log('File read successfully');
          const jsonData = JSON.parse(event.target.result);
          console.log('JSON data parsed:', jsonData);
  
          // Simulate delay
          await new Promise((resolve) => setTimeout(resolve, 3000));
  
          // Process the data according to your logic
          setProcessingStep('Utilizing logic...');
          const { userDataArray, startDate, endDate } = await processData(
            jsonData,
            setProcessingStep,
            console
          );
  
          setUserData(userDataArray);
          setStartDate(startDate);
          setEndDate(endDate);
          console.log('Processed user data:', userDataArray);
          setIsDataParsed(true);
          setProcessingStep('');
          setError('');
        } catch (e) {
          console.error('Error parsing JSON:', e);
          setError('There is an error parsing the JSON file.');
          setProcessingStep('');
        }
      })();
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(userData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'user_pnl_data.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileRead(files[0]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      handleFileRead(files[0]);
    }
  };

  function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
  
    return `${day} ${month} ${hour}:${minute}`;
  }


  return (
    <div className={`container ${sourceCodePro.className}`}>
      <h1>Solray PnL Calculator</h1>

      {!isDataParsed ? (
        <>
          {processingStep ? (
            <Loader processingStep={processingStep} />
          ) : (
            <>
              <div
                className={`dropzone ${isDragActive ? 'active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <p>Drag and drop your JSON file here</p>
                <p>or</p>
                <input
                  type="file"
                  id="fileInput"
                  accept=".json"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="fileInput" className="file-label">
                  Choose a file
                </label>
              </div>
              {error && <p className="error">{error}</p>}
            </>
          )}
        </>
      ) : (
        <div className={`new-view ${sourceCodePro.className}`}>
        <div className="header">
          <h2>User PnL Rankings</h2>
          {startDate && endDate && (
            <p>
            Timeframe: {formatDate(startDate)} - {formatDate(endDate)}
            </p>
          )}
          <button onClick={handleDownload} className={`download-button ${sourceCodePro.className}`}>
            Download
          </button>
        </div>
          {userData.length === 0 ? (
            <p>No SELL messages found.</p>
          ) : (
            <div className="user-list">
              {userData.map((user, index) => (
                <UserBox key={index} user={user} />
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .container {
          text-align: center;
          background-color: black;
          color: white;
          min-height: 100vh;
          padding: 20px;
        }

        h1 {
          margin-bottom: 40px;
        }
        .dropzone {
          border: 2px dashed yellow;
          padding: 50px;
          width: 80%;
          margin: 0 auto;
          transition: background-color 0.2s;
        }
        .dropzone.active {
          background-color: #333;
        }
        .file-label {
          display: inline-block;
          padding: 10px 20px;
          background-color: yellow;
          color: black;
          cursor: pointer;
          margin-top: 10px;
        }
        .error {
          color: red;
          margin-top: 20px;
        }

        .header{
                  display: flex;
          flex-direction: column;
          align-items: center;
          height: 150px;
          space-between: 20px;
          align-items: center;
          justify-content: space-between;
          }
        .new-view {
            margin-top: 40px;
            padding: 20px;
          }
          .download-button {
            padding-bottom: 20px;
            padding-top: 20px;
            background-color: yellow;
            color: black;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 5px; /* Rounded corners */
            font-size: 16px;
            width: 200px;
            align-self: center
          }
          .download-button:hover {
            background-color: yellow-green;
          }
        .user-list {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (max-width: 768px) {
          .dropzone {
            width: 100%;
          }
          .user-box {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}