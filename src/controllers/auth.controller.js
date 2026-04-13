import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';

function authPayload(user) {
  return {
    user: user.toPublicJSON(),
    token: signToken({ sub: user._id.toString(), role: user.role })
  };
}

export async function register(request, response) {
  const { name, email, password, role } = request.validated.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, role });

  return response.status(201).json(authPayload(user));
}

export async function login(request, response) {
  const { email, password } = request.validated.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'User is inactive');
  }

  return response.json(authPayload(user));
}

export async function me(request, response) {
  return response.json({ user: request.user.toPublicJSON() });
}
