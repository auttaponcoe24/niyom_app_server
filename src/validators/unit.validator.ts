import Joi from 'joi';

export const getAllUnitSchema = Joi.object({
  start: Joi.number().required(),
  page_size: Joi.number().required(),
  keywords: Joi.string().optional().allow(''),
  month: Joi.string().required(),
  year: Joi.string().required(),
  zoneId: Joi.number().required(),
  type: Joi.string().required(),
});
