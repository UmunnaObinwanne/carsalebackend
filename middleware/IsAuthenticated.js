
export default function isAuthenticated(req, res, next) {
      console.log('User:', req.user);
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'User is not authenticated' });
}
