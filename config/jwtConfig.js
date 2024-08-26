// config/jwtConfig.js
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d'; // Token expiry time, adjust as needed

export { JWT_SECRET, JWT_EXPIRES_IN };
