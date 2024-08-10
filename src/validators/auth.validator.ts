import Joi from 'joi';

export const registerSchema = Joi.object({
  // firstname: Joi.string().optional().allow(null, ''),
  // lastname: Joi.string().optional().allow(null, ''),
  // id_passpost: Joi.string()
  //   .optional()
  //   .allow(null, '')
  //   .regex(/^[a-zA-Z0-9]{5,15}$/)
  //   .messages({
  //     'string.pattern.base': 'Passport ID must be alphanumeric and between 5 to 15 characters',
  //   }),
  // address: Joi.string().optional().allow(null, ''),
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
  // role: Joi.string().valid('USER', 'ADMIN').default('USER'),
  // status: Joi.string().valid('PENDING', 'REJECT', 'SUCCESS').default('PENDING'),
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

export const editProfileSchema = Joi.object({
  firstname: Joi.string().optional().allow(null, ''),
  lastname: Joi.string().optional().allow(null, ''),
  id_passpost: Joi.string()
    .optional()
    .allow(null, '')
    .regex(/^[a-zA-Z0-9]{5,15}$/)
    .messages({
      'string.pattern.base': 'Passport ID must be alphanumeric and between 5 to 15 characters',
    }),
  address: Joi.string().optional().allow(null, ''),
  role: Joi.string().valid('USER', 'ADMIN').default('USER'),
  status: Joi.string().valid('PENDING', 'REJECT', 'SUCCESS').default('PENDING'),
});
