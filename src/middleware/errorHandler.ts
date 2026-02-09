import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * Error response structure
 */
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: number;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Zod validation error
  if (error instanceof ZodError) {
    const response: ErrorResponse = {
      error: 'Validation Error',
      message: 'Invalid request parameters',
      details: error.errors,
      timestamp: Date.now(),
    };
    res.status(400).json(response);
    return;
  }

  // Custom API errors
  if (error.name === 'NotFoundError') {
    const response: ErrorResponse = {
      error: 'Not Found',
      message: error.message,
      timestamp: Date.now(),
    };
    res.status(404).json(response);
    return;
  }

  // Default server error
  const response: ErrorResponse = {
    error: 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    timestamp: Date.now(),
  };
  res.status(500).json(response);
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ErrorResponse = {
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: Date.now(),
  };
  res.status(404).json(response);
}

/**
 * Custom error classes
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
