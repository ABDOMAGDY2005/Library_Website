async function adminMiddleware(req, res, next) {
    // Check if req or req.user is missing
    if (!req || !req.user) {
        return res.status(401).json({error : "only admins are allowed"}); // Unauthorized
    }
    
    // Check if user is not admin
    if (!req.user.isAdmin) {
        return res.status(401).json({error : "only admins are allowed"}); // Unauthorized
    }

    next();
}

module.exports = adminMiddleware;
