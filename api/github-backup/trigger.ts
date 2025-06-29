
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth.js';
import { storage } from '../../server/storage.js';
import { githubBackup } from '../../server/services/githubBackup.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authToken = req.cookies['auth-token'];
    const user = await authService.verifyToken(authToken);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    await storage.initializeData();

    const numbers = await storage.getNumbers();
    const users = await storage.getAllUsers();

    const backupData = {
      numbers,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      })),
      timestamp: new Date().toISOString()
    };

    await githubBackup.backupToGitHub(backupData, 'manual_backup.json');
    res.json({ success: true, message: "Manual backup completed successfully" });
  } catch (error) {
    console.error("Manual backup error:", error);
    res.status(500).json({ error: "Failed to trigger manual backup" });
  }
}
