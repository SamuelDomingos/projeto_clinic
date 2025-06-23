function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) {
    return false;
  }

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let rest = 11 - (sum % 11);
  let digit = rest > 9 ? 0 : rest;
  if (digit !== parseInt(cpf.charAt(9))) {
    return false;
  }

  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rest = 11 - (sum % 11);
  digit = rest > 9 ? 0 : rest;
  if (digit !== parseInt(cpf.charAt(10))) {
    return false;
  }

  return true;
}

function validateCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]/g, '');

  if (cnpj.length !== 14) {
    return false;
  }

  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  // Validate first digit
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    return false;
  }

  // Validate second digit
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    return false;
  }

  return true;
}

function validatePhone(phone) {
  // Remove all non-digit characters
  phone = phone.replace(/\D/g, '');
  
  // Check if it's a valid Brazilian phone number
  // Format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  return /^[1-9]{2}9?[0-9]{8}$/.test(phone);
}

function formatPhone(phone) {
  // Remove all non-digit characters
  phone = phone.replace(/\D/g, '');
  
  // Format as (XX) XXXXX-XXXX
  return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}

function formatCPF(cpf) {
  // Remove all non-digit characters
  cpf = cpf.replace(/\D/g, '');
  
  // Format as XXX.XXX.XXX-XX
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

function formatCNPJ(cnpj) {
  // Remove all non-digit characters
  cnpj = cnpj.replace(/\D/g, '');
  
  // Format as XX.XXX.XXX/XXXX-XX
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

module.exports = {
  validateCPF,
  validateCNPJ,
  validatePhone,
  formatPhone,
  formatCPF,
  formatCNPJ
}; 