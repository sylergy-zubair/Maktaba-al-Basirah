import authService from "../../../services/authService.js";
import { AppError } from "../../../utils/errors.js";

export const register = async(req, res, next) => {
    try {
        const { email, password } = req.validated;
        const result = await authService.register(email, password);

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async(req, res, next) => {
    try {
        const { email, password } = req.validated;
        const result = await authService.login(email, password);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};