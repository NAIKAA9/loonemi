document.addEventListener('DOMContentLoaded', function () {
  // Form elements
  const form = document.getElementById('loanForm');
  const studentLoanSelect = document.getElementById('student-loan');
  const studentLoanDetails = document.getElementById('student-loan-details');
  const loanBankInput = document.getElementById('loan-bank');
  const loanAmountInput = document.getElementById('loan-amount');
  const loanYearInput = document.getElementById('loan-year');
  const upiInput = document.getElementById('upi');
  const upiError = document.getElementById('upiError');
  const policyLink = document.getElementById('policyLink');
  const declareCheckbox = document.getElementById('declare');
  const submitBtn = document.getElementById('submitBtn');
  const phoneInput = document.querySelector('input[name="phone"]');
  const loanTypeSelect = document.getElementById('loanType');
  const paymentModeSelect = document.getElementById('paymentMode');

  // Initialize form state
  loanBankInput.required = false;
  loanAmountInput.required = false;
  loanYearInput.required = false;
  upiError.style.display = 'none';

  // Show/hide student loan fields
  studentLoanSelect.addEventListener('change', function() {
    const shouldShow = this.value === 'yes';
    studentLoanDetails.style.display = shouldShow ? 'block' : 'none';
    loanBankInput.required = shouldShow;
    loanAmountInput.required = shouldShow;
    loanYearInput.required = shouldShow;
    validateForm();
  });

  // UPI validation (only when payment mode is UPI)
  paymentModeSelect.addEventListener('change', function() {
    upiInput.required = this.value === 'upi';
    upiError.style.display = 'none';
    validateForm();
  });

  upiInput.addEventListener('input', function() {
    const isUPIMode = paymentModeSelect.value === 'upi';
    const isValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(this.value.trim());
    
    if (isUPIMode && !isValid) {
      upiError.style.display = 'block';
    } else {
      upiError.style.display = 'none';
    }
    validateForm();
  });

  // Phone validation
  phoneInput.addEventListener('input', function() {
    const isValid = /^[6-9]\d{9}$/.test(this.value.trim());
    this.setCustomValidity(isValid ? "" : "Enter valid 10-digit Indian phone number");
    validateForm();
  });

  // Loan amount validation
  loanAmountInput.addEventListener('input', function() {
    const isValid = !this.value || parseFloat(this.value) >= 0;
    this.setCustomValidity(isValid ? "" : "Loan amount cannot be negative");
    validateForm();
  });

  // Loan year validation
  loanYearInput.addEventListener('input', function() {
    const currentYear = new Date().getFullYear();
    const year = this.value ? parseInt(this.value) : null;
    const isValid = !year || (year >= 2000 && year <= currentYear);
    
    this.setCustomValidity(isValid ? "" : `Year must be between 2000 and ${currentYear}`);
    validateForm();
  });

  // Enable declaration checkbox
  policyLink.addEventListener('click', function(e) {
    e.preventDefault();
    window.open(this.href, '_blank');
    declareCheckbox.disabled = false;
    validateForm();
  });

  // Form validation function
  function validateForm() {
    const isPhoneValid = /^[6-9]\d{9}$/.test(phoneInput.value.trim());
    const isDeclared = declareCheckbox.checked;
    const isLoanTypeValid = !!loanTypeSelect.value;
    const isPaymentModeValid = !!paymentModeSelect.value;
    
    // Conditional validations
    let isStudentLoanValid = true;
    if (studentLoanSelect.value === 'yes') {
      const currentYear = new Date().getFullYear();
      const year = loanYearInput.value ? parseInt(loanYearInput.value) : null;
      isStudentLoanValid = loanBankInput.value.trim() && 
                          loanAmountInput.value && 
                          year && year >= 2000 && year <= currentYear;
    }
    
    const isUPIValid = paymentModeSelect.value !== 'upi' || 
                      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiInput.value.trim());

    // Enable/disable submit button
    submitBtn.disabled = !(
      isPhoneValid &&
      isDeclared &&
      isLoanTypeValid &&
      isPaymentModeValid &&
      isStudentLoanValid &&
      isUPIValid
    );
  }

  // Validate on all changes
  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', validateForm);
    el.addEventListener('change', validateForm);
  });

  // Handle form submission
  form.addEventListener('submit', function(e) {
    if (submitBtn.disabled) {
      e.preventDefault();
      alert("Please fill all required fields correctly.");
    } else {
      // Format numbers before submission
      if (loanAmountInput.value) {
        loanAmountInput.value = parseFloat(loanAmountInput.value).toFixed(2);
      }
      if (loanYearInput.value) {
        loanYearInput.value = parseInt(loanYearInput.value);
      }
    }
  });

  // Initial validation
  validateForm();
});