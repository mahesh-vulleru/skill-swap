import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User';
import { CreditTransaction } from '../models/CreditTransaction';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/authMiddleware';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_REGISTER_ROLES: UserRole[] = ['learner', 'mentor', 'learner_mentor'];

const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, skillsOffered, skillsWanted } = req.body;

    // 1. Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Name is required and must be at least 2 characters long.',
      });
      return;
    }

    // 2. Validate email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
      return;
    }

    // 3. Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters long.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 4. Role validation & Privilege Escalation Prevention
    let assignedRole: UserRole = 'learner_mentor';
    if (role) {
      if (!ALLOWED_REGISTER_ROLES.includes(role)) {
        res.status(400).json({
          success: false,
          message: `Invalid role selected. Allowed registration roles are: ${ALLOWED_REGISTER_ROLES.join(', ')}. Admin accounts must be granted by existing administrators.`,
        });
        return;
      }
      assignedRole = role;
    }

    // 5. Check duplicate user
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    // 6. Password Hashing with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Create User
    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: assignedRole,
      skillsOffered: Array.isArray(skillsOffered) ? skillsOffered : [],
      skillsWanted: Array.isArray(skillsWanted) ? skillsWanted : [],
      credits: 30, // Initial welcome bonus
      badges: ['Active Learner'],
    });

    // 8. Record initial welcome bonus transaction
    await CreditTransaction.create({
      user: newUser._id,
      amount: 30,
      type: 'bonus',
      description: 'Welcome bonus learning credits',
    });

    const token = generateToken(newUser);
    const userSafe = newUser.toObject();
    delete userSafe.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: userSafe,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({ success: false, message: 'Please provide your password.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Locate user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // 3. Status check
    if (user.status === 'inactive') {
      res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
      return;
    }

    // 4. Verify password hash
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // 5. Generate secure JWT token
    const token = generateToken(user);
    const userSafe = user.toObject();
    delete userSafe.password;

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: userSafe,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error during login.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
};
