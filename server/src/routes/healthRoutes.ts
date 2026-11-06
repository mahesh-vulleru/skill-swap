import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../config/db';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: 'SkillSwap API is running',
    database: dbStatus,
  });
});

export default router;

