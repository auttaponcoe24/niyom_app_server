import Joi from 'joi';

export const registerSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().optional().allow(null, ''),
  card_id: Joi.string().required().length(13).messages({
    'string.length': 'Card ID must be exactly 13 characters long',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
    }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm password is required',
    })
    .strip(),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'string.empty': 'Email is required',
    }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.empty': 'Password is required',
  }),
});

// firstname, lastname, card_id
export const updateProfileSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().optional().allow(null, ''),
  card_id: Joi.string().length(13).required(),
});
