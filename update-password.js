const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function updatePassword() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'clinica_db'
  });

  try {
    // Senha original: "123@Mudar"
    const hashedPassword = await bcrypt.hash('123@Mudar', 10);
    
    // Atualizar a senha do usuário Samuel
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'samuelcrispim@gmail.com']
    );
    
    console.log('✅ Senha atualizada com sucesso!');
    console.log('Email: samuelcrispim@gmail.com');
    console.log('Senha: 123@Mudar (agora criptografada)');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar senha:', error);
  } finally {
    await connection.end();
  }
}

updatePassword(); 