

export default async function isAuthenticated(req, res, next) {
  // Get the token from the authorization header
  const token = req.cookies.authToken || req.headers.authorization?.split('Bearer ')[1];
  console.log('header:', req.headers)
  console.log('cookies:', req.cookies)
  console.log('token', token)

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the ID token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach the user information to the request object
    req.user = decodedToken;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
