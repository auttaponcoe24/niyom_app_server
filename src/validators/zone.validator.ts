import Joi from 'joi';

export const createZoneSchema = Joi.object({
  zone_name: Joi.string().required(),
});

export const getAllZoneSchema = Joi.object({
  start: Joi.number().required(),
  page_size: Joi.number().required(),
  keywords: Joi.string().optional().allow(''),
});

export const getByIdZoneSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const updateZoneSchema = Joi.object({
  id: Joi.number().required(),
  zone_name: Joi.string().required(),
});

export const deleteZoneSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
