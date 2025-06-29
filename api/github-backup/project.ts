
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth.js';
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

    await githubBackup.manualBackup();
    res.json({ success: true, message: "Project backup completed successfully" });
  } catch (error) {
    console.error("Project backup error:", error);
    res.status(500).json({ error: "Failed to trigger project backup" });
  }
}
