const mysql = require('mysql2');
require('dotenv').config();

// MySQL connection configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Add password if necessary
  database: process.env.DB_NAME || 'digital_diary',
  port: process.env.DB_PORT || 3307, // Ensure we're using port 3307
});

// Connecting to MySQL
connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err.message); // Log error message
    console.error('Ensure your .env file is configured correctly.');
    return;
  }
  console.log('Connected to MySQL database:', connection.config.database);
});

module.exports = connection;