import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = 'Database error';
    let statusCode = 400;

    switch (err.code) {
      case 'P2002':
        message = 'Duplicate field value entered';
        statusCode = 400;
        break;
      case 'P2014':
        message = 'Invalid ID';
        statusCode = 400;
        break;
      case 'P2003':
        message = 'Invalid input data';
        statusCode = 400;
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      default:
        message = 'Database operation failed';
        statusCode = 500;
    }

    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Invalid data provided',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: message,
      fields: err.errors
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};