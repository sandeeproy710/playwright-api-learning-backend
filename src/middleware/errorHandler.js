import { ApiError } from '../utils/ApiError.js';

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ApiError) {
    return response.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details || null
      }
    });
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: { message: 'Invalid or expired token' } });
  }

  if (error.name === 'CastError') {
    return response.status(400).json({ error: { message: 'Invalid resource id' } });
  }

  if (error.code === 11000) {
    return response.status(409).json({ error: { message: 'Duplicate value', details: error.keyValue } });
  }

  console.error(error);
  return response.status(500).json({ error: { message: 'Internal server error' } });
}
