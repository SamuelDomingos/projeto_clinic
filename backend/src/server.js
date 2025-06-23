require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize, User, Protocol, Service, ProtocolService, PatientProtocol, PatientServiceSession, Invoice, InvoiceItem, InvoicePayment } = require("./models");
const authRoutes = require("./routes/authRoutes.routes");
const patientRoutes = require("./routes/patientRoutes.routes");
const supplierRoutes = require("./routes/supplierRoutes.routes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes.routes");
const userRoutes = require("./routes/userRoutes.routes");
const permissionRoutes = require("./routes/permissionRoutes.routes");
const appointmentRoutes = require("./routes/appointmentRoutes.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const paymentMethodRoutes = require("./routes/paymentMethodRoutes.routes");
const protocolRoutes = require("./routes/protocolRoutes.routes");
const serviceRoutes = require("./routes/serviceRoutes.routes");
const patientProtocolRoutes = require("./routes/patientProtocolRoutes.routes");
const patientServiceSessionRoutes = require("./routes/patientServiceSessionRoutes.routes");
const invoiceRoutes = require("./routes/invoiceRoutes.routes");
const categoryRoutes = require("./routes/category.routes");
const transactionRoutes = require("./routes/transactionRoutes.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create upload directories if they don't exist
const fs = require("fs");
const uploadDirs = ["uploads", "uploads/patients", "uploads/medical-records"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/users", userRoutes);
app.use("/api", permissionRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/protocols", protocolRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/patient-protocols", patientProtocolRoutes);
app.use("/api/patient-service-sessions", patientServiceSessionRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api", categoryRoutes);
app.use("/api/transactions", transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "MulterError") {
    return res.status(400).json({ error: "File upload error: " + err.message });
  }

  res.status(500).json({ error: "Something went wrong!" });
});

// Função para sincronizar o banco de dados
async function syncDatabase() {
  try {
    // Desabilitar verificação de chaves estrangeiras
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    console.log("Foreign key checks disabled");

    // Primeiro, remover todas as tabelas
    await sequelize.drop();
    console.log("All tables dropped");

    // Habilitar verificação de chaves estrangeiras
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Foreign key checks enabled");

    // Depois, sincronizar todas as tabelas
    await sequelize.sync();
    console.log("All tables created");

    // Verificar se o usuário admin já existe
    const existingAdmin = await User.findOne({
      where: { email: "admin@clinica.com" },
    });
    if (!existingAdmin) {
      // Depois, criar usuário admin
      const adminUser = await User.create({
        name: "Admin",
        email: "admin@clinica.com",
        password: "admin123",
        permissions: ["*"],
        role: "admin",
        status: "active",
      });
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error syncing database:", error);
    throw error;
  }
}

// Iniciar o servidor
async function startServer() {
  try {
    // Conectar ao banco de dados
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Sincronizar banco de dados
    // await syncDatabase();

    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}

startServer();
