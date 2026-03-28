import joi from 'joi';

export const registerValidation = (data) => {
  const schema = joi.object({
    fullName: joi
      .string()
      .trim()
      .min(3)
      .pattern(/^[A-Za-z\s]+$/)
      .required()
      .messages({
        'string.base': 'Full name must be a string',
        'string.min': 'Full name must be at least 3 characters long',
        'string.pattern.base':
          'Full name must only contain alphabets and spaces',
        'any.required': 'Full name is required',
      }),

    email: joi.string().trim().email().required().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email',
      'any.required': 'Email is required',
    }),

    password: joi
      .string()
      .trim()
      .min(8)
      .pattern(/[a-z]/, 'lowercase letter')
      .pattern(/[A-Z]/, 'uppercase letter')
      .pattern(/\d/, 'digit')
      .pattern(/[@#$%&!]/, 'special character')
      .pattern(
        new RegExp(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%&!])[A-Za-z\\d@#$%&!]{8,}$'
        )
      )
      .required()
      .messages({
        'string.base': 'Password must be a string',
        'string.min': 'Passoword must be at least 8 characters long',
        'string.pattern.base':
          'Password must not contain emojis or invalid symbols',
        'string.pattern.name': 'Password must contain at least 1 {#name}',
        'any.required': 'Password is required',
      })
      .trim(),

    profilePic: joi
      .string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Profile picture must be a valid URL',
      })
      .trim(),
  });
  return schema.validate(data, { abortEarly: false });
};

export const loginValidation = (data) => {
  const schema = joi.object({
    email: joi.string().trim().email().required().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Email must be a valid email',
      'any.required': 'Email is required',
    }),

    password: joi.string().trim().min(8).required().messages({
      'string.base': 'Password must be a string',
      'string.min': 'Password must be atleast 8 characters long',
      'any.required': 'Password is required',
    }),
  });
  return schema.validate(data, { abortEarly: false });
};
