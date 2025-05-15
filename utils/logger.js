// src/utils/logger.js
const winston = require('winston');
const path = require('path');

// Define os níveis de log e as cores correspondentes
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define as cores para cada nível de log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Adiciona as cores ao winston
winston.addColors(colors);

// Define o formato de saída dos logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define onde os logs serão armazenados
const transports = [
  // Console para desenvolvimento
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // Arquivo para logs de erro
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
  }),
  
  // Arquivo para todos os logs
  new winston.transports.File({ 
    filename: path.join(__dirname, '../../logs/all.log') 
  }),
];

// Cria a instância do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

module.exports = logger;