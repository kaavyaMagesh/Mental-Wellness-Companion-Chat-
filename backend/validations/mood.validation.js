// validations/mood.validation.js
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/error.middleware.js';

export const validateCreateMood = [
  body('mood')
    .trim()
    .notEmpty().withMessage('Mood label is required')
    .isString().withMessage('Mood must be text'),
    
  body('mood_score')
    .isInt({ min: 1, max: 10 }).withMessage('Mood score must be an integer between 1 and 10'),
    
  body('stress_level')
    .isInt({ min: 1, max: 10 }).withMessage('Stress level must be an integer between 1 and 10'),
    
  body('sleep_quality')
    .isInt({ min: 1, max: 10 }).withMessage('Sleep quality must be an integer between 1 and 10'),
    
  body('energy_level')
    .isInt({ min: 1, max: 10 }).withMessage('Energy level must be an integer between 1 and 10'),
    
  body('note')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Note cannot exceed 1000 characters'),
    
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be sent as an array of strings'),
    
  handleValidationErrors
];

export const validateUpdateMood = [
  body('mood')
    .optional()
    .trim()
    .isString().withMessage('Mood must be text'),
    
  body('mood_score')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Mood score must be an integer between 1 and 10'),
    
  body('stress_level')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Stress level must be an integer between 1 and 10'),
    
  body('sleep_quality')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Sleep quality must be an integer between 1 and 10'),
    
  body('energy_level')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Energy level must be an integer between 1 and 10'),
    
  body('note')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Note cannot exceed 1000 characters'),
    
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be sent as an array of strings'),
    
  handleValidationErrors
];
