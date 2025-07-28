import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address"
    ]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit Indian phone number starting with 6-9"
    ]
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, "Address cannot exceed 200 characters"]
  },
  emi: {
    type: String,
    trim: true
  },
  bank: {
    type: String,
    required: [true, "Bank selection is required"],
    enum: {
      values: ["SBI", "HDFC", "ICICI", "Axis", "PNB", "Slice", "mPokket", "KreditBee", "Other"],
      message: "Please select a valid bank option"
    }
  },
  studentLoan: {
    type: String,
    required: [true, "Please specify if you've used a student loan before"],
    enum: {
      values: ["yes", "no"],
      message: "Please select either 'Yes' or 'No'"
    }
  },
  loanBank: {
    type: String,
    trim: true,
    maxlength: [50, "Bank name cannot exceed 50 characters"]
  },
  loanAmount: {
    type: Number,
    min: [0, "Loan amount cannot be negative"],
    set: function(v) {
      return v === '' || v === undefined ? undefined : parseFloat(v);
    }
  },
  loanYear: {
    type: Number,
    min: [2000, "Loan year must be after 2000"],
    max: [new Date().getFullYear(), "Loan year cannot be in the future"],
    set: function(v) {
      return v === '' || v === undefined ? undefined : parseInt(v);
    }
  },
  loanType: {
    type: String,
    required: [true, "Loan type is required"],
    enum: {
      values: ["home", "personal", "education"],
      message: "Please select a valid loan type"
    }
  },
  paymentMode: {
    type: String,
    required: [true, "Payment mode is required"],
    enum: {
      values: ["cash", "upi", "card", "netbanking", "auto_debit", "ecs", "cheque"],
      message: "Please select a valid payment mode"
    }
  },
  upi: {
    type: String,
    trim: true,
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/,
      "Please enter a valid UPI ID (e.g., name@bank)"
    ]
  },
  declare: {
    type: Boolean,
    required: [true, "You must agree to the terms and policy"],
    set: function(v) {
      return v === 'on' || v === true;
    }
  }
}, {
  timestamps: true
});

// Conditional validation
formSchema.pre('validate', function(next) {
  // Student loan validation
  if (this.studentLoan === 'yes') {
    if (!this.loanBank) this.invalidate('loanBank', 'Bank name required for student loan');
    if (!this.loanAmount) this.invalidate('loanAmount', 'Loan amount required for student loan');
    if (!this.loanYear) this.invalidate('loanYear', 'Loan year required for student loan');
  }

  // UPI validation when payment mode is UPI
  if (this.paymentMode === 'upi' && !this.upi) {
    this.invalidate('upi', 'UPI ID required when payment mode is UPI');
  }
  next();
});

const Form = mongoose.model('Form', formSchema);
export default Form;