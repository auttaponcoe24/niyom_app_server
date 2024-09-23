import Joi from 'joi';

export const getAllTransactionSchema = Joi.object({
  start: Joi.number().required(),
  page_size: Joi.number().required(),
  keywords: Joi.string().optional().allow(''),
  month: Joi.string().required(),
  year: Joi.string().required(),
  zoneId: Joi.number().required(),
  type: Joi.string().required(),
});

export const createTransactionSchema = Joi.object({
  month: Joi.string().optional().allow(null, ''),
  year: Joi.string().optional().allow(null, ''),
  unit_old_date: Joi.number().integer().positive().optional().allow(null, ''),
  unit_new_date: Joi.number().integer().positive().optional().allow(null, ''),
  type: Joi.string().optional().allow('W'),
  zoneId: Joi.number().optional().allow(null, ''),
  paymentId: Joi.number().optional().allow(null, ''),
  customerId: Joi.number().optional().allow(null, ''),
});
