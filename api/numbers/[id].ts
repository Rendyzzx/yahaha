
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authToken = req.cookies['auth-token'];
    const user = await authService.verifyToken(authToken);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    await storage.initializeData();

    const id = parseInt(req.query.id as string);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid number ID" });
    }

    const deleted = await storage.deleteNumber(id);
    if (deleted) {
      res.json({ message: "Number deleted successfully" });
    } else {
      res.status(404).json({ message: "Number not found" });
    }
  } catch (error) {
    console.error("Delete number error:", error);
    res.status(500).json({ message: "Failed to delete number" });
  }
}
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth.js';
import { storage } from '../../server/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authToken = req.cookies['auth-token'];
    const user = await authService.verifyToken(authToken);
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await storage.initializeData();

    const { id } = req.query;
    const numberId = parseInt(id as string);

    if (req.method === 'DELETE') {
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteNumber(numberId);
      res.json({ message: "Number deleted successfully" });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error("Number API error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
}
