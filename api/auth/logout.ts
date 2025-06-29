
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', 'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
  res.json({ message: "Logged out successfully" });
}
