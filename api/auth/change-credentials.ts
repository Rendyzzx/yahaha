
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth';
import { changeCredentialsSchema } from '../../shared/schema';

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

    const changeData = changeCredentialsSchema.parse(req.body);
    const success = await authService.changeCredentials(
      user.id,
      changeData.currentPassword,
      changeData
    );

    if (success) {
      // Generate new token with updated username
      const newToken = authService.generateToken({ ...user, username: changeData.newUsername });
      res.setHeader('Set-Cookie', `auth-token=${newToken}; HttpOnly; Path=/; Max-Age=1800; SameSite=Strict`);
      res.json({ success: true, message: "Credentials updated successfully" });
    } else {
      res.status(400).json({ message: "Current password is incorrect" });
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to update credentials" });
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

    const { currentPassword, newUsername, newPassword } = req.body;

    const success = await authService.changeCredentials(user.id, currentPassword, newUsername, newPassword);
    
    if (success) {
      res.json({ message: "Credentials updated successfully" });
    } else {
      res.status(400).json({ message: "Failed to update credentials" });
    }
  } catch (error) {
    console.error("Change credentials error:", error);
    res.status(500).json({ message: "Failed to change credentials" });
  }
}
