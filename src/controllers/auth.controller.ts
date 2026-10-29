import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';

export class AuthController {
  static showLogin(req: Request, res: Response): void {
    res.render('auth/login', {
      title: 'Sign In - Todo App',
    });
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log(req.body);
    const { identifier, password } = req.body;

    try {
      // Find user by either email or username
      let user = await UserModel.findByEmail(identifier);
      if (!user) {
        user = await UserModel.findByUsername(identifier);
      }

      if (!user) {
        req.flash('error', 'Invalid email/username or password.');
        return res.redirect('/login');
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        req.flash('error', 'Invalid email/username or password.');
        return res.redirect('/login');
      }

      // Populate session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      req.flash('success', `Welcome back, ${user.username}!`);

      if (user.role === 'admin') {
        return res.redirect('/admin');
      }
      return res.redirect('/todos');
    } catch (error) {
      next(error);
    }
  }

  static showRegister(req: Request, res: Response): void {
    res.render('auth/register', {
      title: 'Create Account - Todo App',
    });
  }

  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { username, email, password } = req.body;

    try {
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        req.flash('error', 'An account with this email address already exists.');
        return res.redirect('/register');
      }

      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        req.flash('error', 'This username is already taken. Please choose another.');
        return res.redirect('/register');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUserId = await UserModel.create({
        username,
        email,
        password_hash: passwordHash,
        role: 'user', // Default registered users are regular users
      });

      // Automatically sign them in
      req.session.user = {
        id: newUserId,
        username,
        email,
        role: 'user',
      };

      req.flash('success', 'Your account has been created successfully! Welcome to your Todo Dashboard.');
      return res.redirect('/todos');
    } catch (error) {
      next(error);
    }
  }

  static logout(req: Request, res: Response): void {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/login');
    });
  }
}
