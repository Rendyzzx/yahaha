
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth';
import { secureUserStorage } from '../../server/security/userStorage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authToken = req.cookies['auth-token'];
    const user = await authService.verifyToken(authToken);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Username, password, and role are required" });
    }

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Role must be either 'admin' or 'user'" });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const newUser = await secureUserStorage.createUser(username, password, role);

    res.status(201).json({ 
      success: true, 
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error: any) {
    if (error.message === "Username already exists") {
      res.status(409).json({ message: "Username already exists" });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  }
}
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authToken = req.cookies['auth-token'];
    const user = await authService.verifyToken(authToken);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { username, password, role } = req.body;

    const newUser = await authService.createUser({ username, password, role });
    
    if (newUser) {
      res.status(201).json({ 
        message: "User created successfully",
        user: { id: newUser.id, username: newUser.username, role: newUser.role }
      });
    } else {
      res.status(400).json({ message: "Failed to create user" });
    }
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
}
