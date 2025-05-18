const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./userModel');
const Book = require('./bookModel');

const Loan = sequelize.define('Loan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  loan_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  due_date: { type: DataTypes.DATE, allowNull: false },
  return_date: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('active','returned','overdue'), defaultValue: 'active' }
}, {
  tableName: 'loans',
  timestamps: true
});

User.hasMany(Loan, { foreignKey: 'user_id' });
Loan.belongsTo(User, { foreignKey: 'user_id' });
Book.hasMany(Loan, { foreignKey: 'book_id' });
Loan.belongsTo(Book, { foreignKey: 'book_id' });

module.exports = Loan;