const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./userModel');
const Book = require('./bookModel');

const Loan = sequelize.define('Loan', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER, allowNull: true },
  book_id:    { type: DataTypes.INTEGER, allowNull: true },
  loan_date:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  due_date:   { type: DataTypes.DATE, allowNull: false },
  return_date:{ type: DataTypes.DATE, allowNull: true },
  status:     { type: DataTypes.ENUM('active','returned','overdue'), defaultValue: 'active' }
}, {
  tableName: 'loans',
  timestamps: true,
  underscored: true
});

User.hasMany(Loan,  { foreignKey: 'user_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Loan.belongsTo(User,{ foreignKey: 'user_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Book.hasMany(Loan,  { foreignKey: 'book_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Loan.belongsTo(Book,{ foreignKey: 'book_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

module.exports = Loan;