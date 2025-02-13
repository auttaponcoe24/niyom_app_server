import z from 'zod';

// prefixId, firstname, lastname, card_id, phone, house_number, address, zoneId
// export const createCustomerSchema = Joi.object({
//   prefixId: Joi.number().required(),
//   firstname: Joi.string().required(),
//   lastname: Joi.string().optional().allow(null, ''),
//   card_id: Joi.string().required().length(13).messages({
//     'string.length': 'Card ID must be exactly 13 characters long',
//   }),
//   phone: Joi.string().optional().allow(null, ''),
//   house_number: Joi.string().optional().allow(null, ''),
//   address: Joi.string().optional().allow(null, ''),
//   zoneId: Joi.number().optional().allow(null, ''),
// });
export const createCustomerSchema = z.object({
  prefixId: z.number().min(1),
  no: z.number().min(1),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  cardId: z.string().length(13, 'Card ID must be exactly 13 characters long').optional(),
  phoneNumber: z.string().max(10).optional(),
  houseNumber: z.string().optional(),
  address: z.string().optional(),
  zoneId: z.number().optional(),
});

// export const updateCustomerSchema = Joi.object({
//   id: Joi.string().required(),
//   card_id: Joi.string().length(13).required().messages({
//     message: 'Card ID must be exactly 13 characters long',
//   }),
//   firstname: Joi.string().optional().allow(null, ''),
//   lastname: Joi.string().optional().allow(null, ''),
//   phone: Joi.string().optional().allow(null, ''),
//   house_number: Joi.string().optional().allow(null, ''),
//   address: Joi.string().optional().allow(null, ''),
//   zoneId: Joi.number().optional().allow(null, ''),
//   prefixId: Joi.number().required(),
// });
export const updateCustomerSchema = z.object({
  id: z.string().min(1),
  no: z.number().min(1),
  cardId: z.string().length(13, 'Card ID must be exactly 13 characters long').optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().max(10).optional(),
  houseNumber: z.string().optional(),
  address: z.string().optional(),
  zoneId: z.number().optional(),
  prefixId: z.number().min(1),
});
