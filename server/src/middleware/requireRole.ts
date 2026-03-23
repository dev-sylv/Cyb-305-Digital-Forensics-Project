import { Request, Response, NextFunction } from "express";

const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user.role !== role) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
};

export default requireRole;
