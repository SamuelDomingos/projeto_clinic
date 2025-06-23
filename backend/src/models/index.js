const sequelize = require("../config/database");

// Import models
const User = require("./User");
const Category = require("./Category");
const Transaction = require("./Transaction");
const PaymentMethod = require("./PaymentMethod");
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const Permission = require('./Permission');
const { Product, StockLocation, StockMovement } = require('./Product');
const Supplier = require('./Supplier');
const PurchaseOrder = require('./PurchaseOrder');
const Protocol = require('./Protocol');
const Service = require('./Service');
const ProtocolService = require('./ProtocolService');
const PatientProtocol = require('./PatientProtocol');
const PatientServiceSession = require('./PatientServiceSession');
const { Invoice, InvoiceItem, InvoicePayment } = require("./Invoice");

// Initialize models
const models = {
  User,
  Category,
  Transaction,
  PaymentMethod,
  Patient,
  Appointment,
  MedicalRecord,
  Permission,
  Product,
  StockLocation,
  StockMovement,
  Supplier,
  PurchaseOrder,
  Protocol,
  Service,
  ProtocolService,
  PatientProtocol,
  PatientServiceSession,
  Invoice,
  InvoiceItem,
  InvoicePayment,
};

// Associate models
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Definir associações
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
User.hasMany(Appointment, { foreignKey: 'doctorId' });
Patient.hasMany(MedicalRecord, { foreignKey: 'patientId' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });

// Associações de estoque
User.hasMany(StockMovement, { foreignKey: 'userId' });
StockMovement.belongsTo(User, { foreignKey: 'userId' });

// Associações do PaymentMethod
PaymentMethod.belongsTo(User, { foreignKey: "beneficiaryId", as: "user", constraints: false });
PaymentMethod.belongsTo(Supplier, { foreignKey: "beneficiaryId", as: "supplier", constraints: false });

// Associações para Protocolos e Serviços
Protocol.hasMany(ProtocolService, { foreignKey: 'protocolId' });
ProtocolService.belongsTo(Protocol, { foreignKey: 'protocolId' });

Service.hasMany(ProtocolService, { foreignKey: 'serviceId' });
ProtocolService.belongsTo(Service, { foreignKey: 'serviceId' });

Patient.hasMany(PatientProtocol, { foreignKey: 'patientId' });
PatientProtocol.belongsTo(Patient, { foreignKey: 'patientId' });

Protocol.hasMany(PatientProtocol, { foreignKey: 'protocolId' });
PatientProtocol.belongsTo(Protocol, { foreignKey: 'protocolId' });

PatientProtocol.hasMany(PatientServiceSession, { foreignKey: 'patientProtocolId' });
PatientServiceSession.belongsTo(PatientProtocol, { foreignKey: 'patientProtocolId' });

ProtocolService.hasMany(PatientServiceSession, { foreignKey: 'protocolServiceId' });
PatientServiceSession.belongsTo(ProtocolService, { foreignKey: 'protocolServiceId' });

// Associações para Invoice
Invoice.belongsTo(Patient, { 
  foreignKey: 'patientId',
  as: 'patient'
});
Invoice.belongsTo(Protocol, { 
  foreignKey: 'protocolId',
  as: 'protocol'
});
Invoice.hasMany(InvoiceItem, { 
  foreignKey: 'invoiceId',
  as: 'items'
});
Invoice.hasMany(InvoicePayment, { 
  foreignKey: 'invoiceId',
  as: 'payments'
});

InvoiceItem.belongsTo(Invoice, { 
  foreignKey: 'invoiceId',
  as: 'invoice'
});
InvoiceItem.belongsTo(Protocol, { 
  foreignKey: 'protocolId',
  as: 'protocol'
});

InvoicePayment.belongsTo(Invoice, { 
  foreignKey: 'invoiceId',
  as: 'invoice'
});
InvoicePayment.belongsTo(PaymentMethod, { 
  foreignKey: 'paymentMethodId',
  as: 'paymentMethod'
});

// Associação User-Permission
User.belongsToMany(Permission, { through: 'user_permissions', foreignKey: 'userId', otherKey: 'permissionId' });
Permission.belongsToMany(User, { through: 'user_permissions', foreignKey: 'permissionId', otherKey: 'userId' });

module.exports = {
  sequelize,
  ...models,
};