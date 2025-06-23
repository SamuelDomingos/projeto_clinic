const { validateCPF, validateCNPJ, validatePhone } = require('../utils/validators');

const validatePatientData = (req, res, next) => {
  const { cpf, phone } = req.body;

  if (cpf && !validateCPF(cpf)) {
    return res.status(400).json({ error: 'Invalid CPF' });
  }

  if (phone && !validatePhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  next();
};

const validateSupplierData = (req, res, next) => {
  const { cnpj, phone } = req.body;

  if (cnpj && !validateCNPJ(cnpj)) {
    return res.status(400).json({ error: 'Invalid CNPJ' });
  }

  if (phone && !validatePhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  next();
};

const validateDate = (date) => {
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
};

const validateAppointmentData = (req, res, next) => {
  const { date, time } = req.body;

  if (date && !validateDate(date)) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  if (time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    return res.status(400).json({ error: 'Invalid time format' });
  }

  next();
};

module.exports = {
  validatePatientData,
  validateSupplierData,
  validateAppointmentData
}; 