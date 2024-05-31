import React, { useState } from 'react';

const ApiRequest = () => {
  // export default ApiRequest = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');


  const fetchData = async () => {
    try {
     const response = await fetch(apiUrl);
// const response = await fetch(apiUrl, {
//   method: 'GET', // Specify the HTTP method (GET, POST, etc.)
//   headers: {
//     'Content-Type': 'application/json', // Specify the content type
//     'api_key': apiKey // Add your custom header
//   } });
 
      if (response.ok) {
        const data = await response.json();
        setResult(JSON.stringify(data, null, 2));
      } else {
        if (response.status === 400) {
          setError("Entered API doesn't exist.");
        } else {
          setError('An error occurred while fetching the data.');
        }
        setResult('');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An error occurred while fetching the data.');
      setResult('');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter API URL"
        value={apiUrl}
        onChange={(e) => setApiUrl(e.target.value)}
      />
      <button onClick={fetchData}>Fetch Data</button>
      <div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {result && <pre>{result}</pre>}
      </div>
    </div>
  );
};

export default ApiRequest;
