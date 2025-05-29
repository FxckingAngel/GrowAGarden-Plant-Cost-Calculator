const priceDB = {};

function keyForEntry(plant, modifiers) {
  return plant.toLowerCase() + '|' + (modifiers ? modifiers.sort().join(',') : '');
}

function verifyPrice(plant, modifiers, weight, price) {
  const key = keyForEntry(plant, modifiers);
  const entries = priceDB[key] || [];
  if (entries.length === 0) return true;

  const pricesPerKg = entries.map(e => e.price / e.weight).sort((a, b) => a - b);
  const median = pricesPerKg.length % 2 === 1
    ? pricesPerKg[(pricesPerKg.length - 1) / 2]
    : (pricesPerKg[pricesPerKg.length / 2 - 1] + pricesPerKg[pricesPerKg.length / 2]) / 2;

  const pricePerKg = price / weight;
  return pricePerKg >= median / 3 && pricePerKg <= median * 3;
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json(priceDB);
  }

  if (req.method === 'POST') {
    const { plant, modifiers, weight, price } = req.body;

    if (!plant || !weight || !price || weight <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    if (!Array.isArray(modifiers)) {
      return res.status(400).json({ error: 'Modifiers must be an array' });
    }

    const isValid = verifyPrice(plant, modifiers, weight, price);
    if (!isValid) {
      return res.status(400).json({ error: 'AI rejected this price (suspicious or outlier)' });
    }

    const key = keyForEntry(plant, modifiers);
    if (!priceDB[key]) priceDB[key] = [];
    priceDB[key].push({ weight, price, timestamp: Date.now() });

    return res.status(200).json({ message: 'Price accepted' });
  }

  res.status(405).end(); // Method Not Allowed
};
