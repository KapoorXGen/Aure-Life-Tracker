import { Request, Response, NextFunction } from "express";

export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // 1. Check whether user is logged in
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized. Please login first.",
        });
    }

    // 2. Allow request to continue
    next();
};