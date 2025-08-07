import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';
import Form from './models/forms.js';
import 'dotenv/config';

// Setup __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection caching (for serverless environments)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/form', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect to DB at cold start
await connectDB();

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

// ✅ Local server link (for dev testing)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// ✅ Export handler for serverless environments
export const handler = serverless(app);
