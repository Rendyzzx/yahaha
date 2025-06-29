
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authService } from '../../server/auth.js';
import { storage } from '../../server/storage.js';
import { insertNumberSchema } from '../../shared/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const authToken = req.cookies['auth-token'];
    const user = await authService.verifyToken(authToken);
    
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await storage.initializeData();

    if (req.method === 'GET') {
      const numbers = await storage.getNumbers();
      res.json(numbers);
    } else if (req.method === 'POST') {
      const numberData = insertNumberSchema.parse(req.body);
      const newNumber = await storage.addNumber(numberData);
      res.status(201).json(newNumber);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ message: "Invalid number data", errors: error.errors });
    } else {
      console.error("Numbers API error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  }
}
