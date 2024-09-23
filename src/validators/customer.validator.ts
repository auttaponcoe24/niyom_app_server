import Joi from 'joi';

// prefixId, firstname, lastname, card_id, phone, house_number, address, zoneId
export const createCustomerSchema = Joi.object({
  prefixId: Joi.number().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().optional().allow(null, ''),
  card_id: Joi.string().required().length(13).messages({
    'string.length': 'Card ID must be exactly 13 characters long',
  }),
  phone: Joi.string().optional().allow(null, ''),
  house_number: Joi.string().optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  zoneId: Joi.number().optional().allow(null, ''),
});

export const getAllCustomerSchema = Joi.object({
  start: Joi.number().required(),
  page_size: Joi.number().required(),
  keywords: Joi.string().optional().allow(''),
});

export const getByIdCustomerSchema = Joi.object({
  id: Joi.string().required(),
});

export const updateCustomerSchema = Joi.object({
  id: Joi.string().required(),
  card_id: Joi.string().length(13).required().messages({
    message: 'Card ID must be exactly 13 characters long',
  }),
  firstname: Joi.string().optional().allow(null, ''),
  lastname: Joi.string().optional().allow(null, ''),
  phone: Joi.string().optional().allow(null, ''),
  house_number: Joi.string().optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  zoneId: Joi.number().optional().allow(null, ''),
  prefixId: Joi.number().required(),
});

export const deleteCustomerSchema = Joi.object({
  id: Joi.string().required(),
});
