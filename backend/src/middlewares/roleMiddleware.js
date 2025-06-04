/**
 * Middleware to authorize users based on their roles.
 * Assumes that the protect middleware has already run and populated req.user
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    // Check if the user's role is in the allowedRoles array
    const hasRequiredRole = allowedRoles.includes(req.user.role);

    if (!hasRequiredRole) {
      return res
        .status(403)
        .json({
          message: "Acesso negado: Você não possui a permissão necessária.",
        });
    }

    next(); // User has the required role, proceed to the next middleware/route handler
  };
};
