
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../server/auth.js';
import { storage } from '../server/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authToken = req.cookies['auth-token'];
    const user = await authService.verifyToken(authToken);
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await storage.initializeData();

    const numbers = await storage.getNumbers();
    const users = user.role === "admin" ? await storage.getAllUsers() : [];

    const exportData = {
      numbers,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      })),
      exportedAt: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
}
