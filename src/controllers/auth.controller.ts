import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { HttpError } from '../utils/httpError';

export class AuthController {
    private readonly service = new AuthService();

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { username, password } = req.body ?? {};
            if (typeof username !== 'string' || typeof password !== 'string') {
                throw new HttpError(400, 'Debe proporcionar username y password');
            }

            const user = await this.service.login(username, password);
            res.json({ user });
        } catch (error) {
            next(error);
        }
    };
}
