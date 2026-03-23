declare namespace Express {
  interface Request {
    user: {
      userId: string;
      email: string;
      fullName: string;
      role: string;
    };
  }
}
