// Auth0 Declarations
declare namespace Express {
  interface User {
    id: number;
    username: string;
  }

  interface Request {
    oidc: {
      isAuthenticated: () => boolean;
      user?: any;
    };
  }
}