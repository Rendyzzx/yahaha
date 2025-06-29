
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth';
import { githubBackup } from '../../server/services/githubBackup';

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

    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    await githubBackup.addRemote(repoUrl);
    res.json({ success: true, message: "GitHub backup configured successfully" });
  } catch (error) {
    console.error("GitHub backup configuration error:", error);
    res.status(500).json({ error: "Failed to configure GitHub backup" });
  }
}
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

    const { token, repo } = req.body;
    
    await githubBackup.configure({ token, repo });
    res.json({ success: true, message: "GitHub backup configured successfully" });
  } catch (error) {
    console.error("GitHub backup configuration error:", error);
    res.status(500).json({ error: "Failed to configure GitHub backup" });
  }
}
