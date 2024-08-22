export default (req, res, next) => {
    console.log('User:', req.user);
    if (req.isAuthenticated) {
        return next();
    }
    console.log('Access denied. Redirecting...');
    res.status(403).json({ error: 'You must be logged to view this' });
}