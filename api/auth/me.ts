
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authToken = req.cookies['auth-token'];
    
    if (!authToken) {
      return res.json({ isAuthenticated: false });
    }

    const user = await authService.verifyToken(authToken);
    
    if (user) {
      res.json({ 
        isAuthenticated: true,
        userId: user.id,
        username: user.username,
        role: user.role
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(500).json({ message: "Failed to verify user" });
  }
}
