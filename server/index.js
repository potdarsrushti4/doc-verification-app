const express = require('express');
const cors = require('cors');
const verifyRoute = require('./routes/verify');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Route
app.use('/api/verify', verifyRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
