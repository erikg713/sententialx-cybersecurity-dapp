const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Pi Authentication route placeholder
app.post('/auth', (req, res) => {
  console.log("Auth request received");
  res.json({ message: 'Pi Authentication flow placeholder' });
});

// Pi Payments route placeholder
app.post('/pay', (req, res) => {
  console.log("Payment request received");
  res.json({ message: 'Pi Payment flow placeholder' });
});

// KYC route placeholder
app.post('/kyc', (req, res) => {
  console.log("KYC submission received");
  res.json({ message: 'KYC Verification flow placeholder' });
});

app.listen(5000, () => console.log('Backend running on port 5000'));
