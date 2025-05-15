const User = require('../models/userModel');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
// Importação correta para evitar dependência circular
const authConfig = require('../config/auth');
const crypto = require('crypto');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token usando propriedades do objeto
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name,
        email: user.email, 
        role: user.role 
      },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiration }
    );
    
    // Generate refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Save refresh token to database
    await User.saveRefreshToken(user.id, refreshToken, new Date(Date.now() + parseTimeToMs(authConfig.refreshTokenExpiration)));
    
    // Log user login
    console.log(`User logged in: ${user.name} (${user.email}), Role: ${user.role}`);
    
    res.json({ 
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create user (with default role if not provided)
    const userId = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'user',
      verificationToken,
      verified: false
    });
    
    // Send verification email (mock implementation)
    console.log(`Verification email sent to ${email} with token: ${verificationToken}`);
    
    res.status(201).json({ 
      message: 'User registered successfully. Please verify your email.',
      userId 
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Find user by refresh token
    const user = await User.findByRefreshToken(refreshToken);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Check if refresh token is expired
    if (new Date(user.refreshTokenExpiry) < new Date()) {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    
    // Generate new JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name,
        email: user.email, 
        role: user.role 
      },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiration }
    );
    
    // Generate new refresh token
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    
    // Save new refresh token to database
    await User.saveRefreshToken(user.id, newRefreshToken, new Date(Date.now() + parseTimeToMs(authConfig.refreshTokenExpiration)));
    
    res.json({ 
      message: 'Token refreshed successfully',
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Remove refresh token from database
      await User.removeRefreshToken(refreshToken);
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Find user by verification token
    const user = await User.findByVerificationToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    
    // Mark user as verified
    await User.verifyUser(user.id);
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If your email is registered, you will receive a password reset link' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    // Save reset token to database
    await User.saveResetToken(user.id, resetToken, resetTokenExpiry);
    
    // Send reset email (mock implementation)
    console.log(`Password reset email sent to ${email} with token: ${resetToken}`);
    
    res.json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Find user by reset token
    const user = await User.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Check if token is expired
    if (new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ message: 'Reset token expired' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user password and clear reset token
    await User.resetPassword(user.id, hashedPassword);
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// Auxiliar para converter string de tempo em milissegundos
const parseTimeToMs = (timeString) => {
  const num = parseInt(timeString);
  const unit = timeString.slice(-1);
  
  switch(unit) {
    case 'h': return num * 60 * 60 * 1000; // horas
    case 'd': return num * 24 * 60 * 60 * 1000; // dias
    default: return num * 1000; // segundos
  }
};