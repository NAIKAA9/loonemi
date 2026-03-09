import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Form from './models/forms.js';
import 'dotenv/config';

// Setup __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection caching (for serverless environments)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      // VERCEL check covers preview deployments where NODE_ENV may not be 'production'
      const platform = process.env.VERCEL ? 'Vercel Project Settings → Environment Variables' : 'your hosting provider\'s environment variables';
      throw new Error(`MONGODB_URI environment variable is not set. Add it in ${platform}.`);
    }
    console.warn('⚠️  MONGODB_URI not set — falling back to localhost. Set it in .env for production.');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri || 'mongodb://localhost:27017/form', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/forms', async (req, res) => {
  console.log('📩 Received data:', req.body);

  try {
    await connectDB();

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

    let errorMessage;
    let statusCode;
    if (err.name === 'ValidationError' && err.errors) {
      const firstError = Object.values(err.errors)[0];
      errorMessage = firstError?.message || "Please check your inputs and try again.";
      statusCode = 400;
    } else {
      errorMessage = "Server error. Please try again later.";
      statusCode = 500;
    }

    res.status(statusCode).send(`
      <script>
        alert(${JSON.stringify(errorMessage)});
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

// Export app for Vercel Node runtime
export default app;
