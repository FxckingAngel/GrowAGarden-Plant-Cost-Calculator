import React, { useState, useEffect } from 'react';

const BACKEND_URL = '/api/server';

function App() {
  const [plant, setPlant] = useState('');
  const [modifiers, setModifiers] = useState(''); // comma separated
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [globalPrices, setGlobalPrices] = useState({});

  // Load global prices on mount
  useEffect(() => {
    fetchGlobalPrices();
  }, []);

  async function fetchGlobalPrices() {
    try {
      const res = await fetch(BACKEND_URL + '/prices');
      const data = await res.json();
      setGlobalPrices(data);
      console.log('Global prices loaded', data);
    } catch {
      setStatusMsg('Failed to load global prices');
    }
  }

  // Submit price to backend for AI verification & global save
  async function submitPrice() {
    if (!plant || !weight || !price) {
      setStatusMsg('Please fill all required fields');
      return;
    }

    const weightNum = parseFloat(weight);
    const priceNum = parseFloat(price);
    if (isNaN(weightNum) || isNaN(priceNum) || weightNum <= 0 || priceNum <= 0) {
      setStatusMsg('Weight and price must be positive numbers');
      return;
    }

    const modArr = modifiers
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    try {
      setStatusMsg('Submitting price...');
      const res = await fetch(BACKEND_URL + '/submit-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plant,
          modifiers: modArr,
          weight: weightNum,
          price: priceNum,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg('✅ Price accepted and saved globally!');
        fetchGlobalPrices(); // Refresh global prices after submission
      } else {
        setStatusMsg('❌ ' + (data.error || 'Submission rejected'));
      }
    } catch (err) {
      setStatusMsg('Error submitting price: ' + err.message);
    }
  }

  // Show calculated price per kg from global data for current plant/modifiers
  function getMedianPricePerKg() {
    const key = plant.toLowerCase() + '|' + (modifiers ? modifiers.split(',').map(m => m.trim()).sort().join(',') : '');
    const entries = globalPrices[key] || [];
    if (entries.length === 0) return null;

    const pricesPerKg = entries.map(e => e.price / e.weight).sort((a,b) => a - b);

    const median = pricesPerKg.length % 2 === 1
      ? pricesPerKg[(pricesPerKg.length - 1) / 2]
      : (pricesPerKg[pricesPerKg.length/2 -1] + pricesPerKg[pricesPerKg.length/2]) / 2;

    return median.toFixed(2);
  }

  return (
    <div style={{ maxWidth: 600, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>GrowAGarden Plant Cost Calculator</h1>

      <label>
        Plant name:<br/>
        <input
          type="text"
          value={plant}
          onChange={e => setPlant(e.target.value)}
          placeholder="e.g. strawberry"
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
      </label>

      <label>
        Modifiers (comma separated):<br/>
        <input
          type="text"
          value={modifiers}
          onChange={e => setModifiers(e.target.value)}
          placeholder="e.g. wet, frozen, gold"
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
      </label>

      <label>
        Weight (kg):<br/>
        <input
          type="number"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="e.g. 0.25"
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          step="0.01"
        />
      </label>

      <label>
        Price ($):<br/>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="e.g. 135"
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          step="0.01"
        />
      </label>

      <button
        onClick={submitPrice}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 15,
          fontSize: 16,
          borderRadius: 4,
        }}
      >
        Submit Price
      </button>

      <div style={{ marginBottom: 15, fontWeight: 'bold' }}>
        {statusMsg}
      </div>

      <div style={{ backgroundColor: '#f9f9f9', padding: 10, borderRadius: 4 }}>
        <h3>Global Data Info</h3>
        {plant ? (
          <>
            <div>Median Price per kg for "{plant}" with modifiers [{modifiers || 'none'}]:</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 5 }}>
              {getMedianPricePerKg() ? `$${getMedianPricePerKg()}` : 'No data yet'}
            </div>
          </>
        ) : (
          <div>Enter a plant name to see global median prices.</div>
        )}
      </div>
    </div>
  );
}

export default App;
