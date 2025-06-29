
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth';
import { secureUserStorage } from '../../server/security/userStorage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authToken = req.cookies['auth-token'];
    const user = await authService.verifyToken(authToken);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await secureUserStorage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth.js';
import { storage } from '../../server/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authToken = req.cookies['auth-token'];
    const user = await authService.verifyToken(authToken);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    await storage.initializeData();

    if (req.method === 'GET') {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        createdAt: u.createdAt
      }));
      res.json(safeUsers);
    } else if (req.method === 'DELETE') {
      const { userId } = req.body;
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Users API error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
}
