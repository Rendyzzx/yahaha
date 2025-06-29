
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth.js';
import { loginSchema } from '../../shared/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const loginData = loginSchema.parse(req.body);
    const user = await authService.validateLogin(loginData);

    if (user) {
      // For Vercel, we'll use JWT tokens instead of sessions
      const token = authService.generateToken(user);
      
      res.setHeader('Set-Cookie', `auth-token=${token}; HttpOnly; Path=/; Max-Age=1800; SameSite=Strict`);
      res.json({ success: true, message: "Login successful", user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ message: "Invalid request data" });
  }
}
