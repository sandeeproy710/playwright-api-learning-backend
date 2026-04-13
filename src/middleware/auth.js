import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (request, _response, next) => {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authorization header must be in the format: Bearer <token>');
  }

  const token = header.slice('Bearer '.length);
  const payload = verifyToken(token);
  const user = await User.findById(payload.sub).select('-passwordHash');

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  request.user = user;
  return next();
});
