import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwtConfig.js'; // Adjust as needed

const authenticateJWT = (req, res, next) => {
  // Ensure token is correctly retrieved from cookies
  const token = req.cookies.token;
  
  // Log the token for debugging
  console.log('Token:', token);

  if (!token) {
    // Move to the next middleware with the "authenticated" status set to false
    req.authenticated = false;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Move to the next middleware with the "authenticated" status set to false
      req.authenticated = false;
      return next();
    }

    req.user = user; // Attach user info to request object
    req.authenticated = true;
    next();
  });
};

export default authenticateJWT;
