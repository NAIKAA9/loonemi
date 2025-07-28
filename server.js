import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import Form from './models/forms.js';
import 'dotenv/config';

// Configure paths and initialize app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/form', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};
connectDB();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/forms', async (req, res) => {
  console.log('📩 Received data:', req.body);

  try {
    const formData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      emi: req.body.emi,
      bank: req.body.bank,
      studentLoan: req.body['student-loan'],
      loanBank: req.body['student-loan'] === 'yes' ? req.body['loan-bank'] : undefined,
      loanAmount: req.body['student-loan'] === 'yes' ? parseFloat(req.body['loan-amount']) : undefined,
      loanYear: req.body['student-loan'] === 'yes' ? parseInt(req.body['loan-year']) : undefined,
      loanType: req.body.loanType,
      paymentMode: req.body.paymentMode,
      upi: req.body.upi,
      declare: req.body.declare
    };

    const form = new Form(formData);
    await form.save();

    res.send(`
      <script>
        alert("Thank you! Your form has been submitted.");
        window.location.href = "/";
      </script>
    `);
  } catch (err) {
    console.error('❌ Error saving to MongoDB:', err);
    
    let errorMessage = "Failed to submit form. Please check your inputs and try again.";
    if (err.errors) {
      const firstError = Object.values(err.errors)[0];
      errorMessage = firstError.message || errorMessage;
    }

    res.status(400).send(`
      <script>
        alert("${errorMessage.replace(/"/g, '\\"')}");
        window.location.href = "/";
      </script>
    `);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err);
  res.status(500).send(`
    <script>
      alert("An unexpected error occurred. Please try again later.");
      window.location.href = "/";
    </script>
  `);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down...');
  mongoose.connection.close();
  process.exit(0);
});