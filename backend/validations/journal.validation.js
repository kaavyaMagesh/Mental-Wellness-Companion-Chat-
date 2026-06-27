// validations/journal.validation.js
import { body, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/error.middleware.js';

export const validateCreateJournal = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters'),
    
  body('content')
    .trim()
    .notEmpty().withMessage('Journal content is required')
    .isLength({ min: 10 }).withMessage('Journal content must be at least 10 characters long'),
    
  body('mood_link')
    .optional({ nullable: true })
    .isUUID().withMessage('mood_link must be a valid UUID format'),
    
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be sent as an array of strings'),
    
  body('is_private')
    .optional()
    .isBoolean().withMessage('is_private must be boolean'),
    
  handleValidationErrors
];

export const validateUpdateJournal = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Title cannot exceed 255 characters'),
    
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Journal content must be at least 10 characters long'),
    
  body('mood_link')
    .optional({ nullable: true })
    .isUUID().withMessage('mood_link must be a valid UUID format'),
    
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be sent as an array of strings'),
    
  body('is_private')
    .optional()
    .isBoolean().withMessage('is_private must be boolean'),
    
  handleValidationErrors
];

export const validateSearchQuery = [
  query('q')
    .trim()
    .notEmpty().withMessage('Search keyword query is required')
    .isLength({ min: 2 }).withMessage('Search query must have at least 2 characters'),
    
  handleValidationErrors
];
