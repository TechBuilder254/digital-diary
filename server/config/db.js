const mysql = require('mysql2');
require('dotenv').config();

// MySQL connection configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Add password if necessary
  database: process.env.DB_NAME || 'digital_diary',
  port: process.env.DB_PORT || 3306, // XAMPP default port
});

// Connecting to MySQL
connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err.message); // Log error message
    console.error('Ensure your .env file is configured correctly.');
    console.error('Make sure XAMPP MySQL is running on port 3306');
    console.error('Server will continue to run but database features will not work.');
    return;
  }
  console.log('Connected to MySQL database:', connection.config.database);
});

module.exports = connection;