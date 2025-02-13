export const responseSuccess = (
  data: Record<string, unknown> | Record<string, unknown>[],
  message?: string,
): Record<string, unknown>[] | Record<string, unknown> => {
  return data.hasOwnProperty('data')
    ? {
        status: true,
        message: message || 'success',
        ...data,
      }
    : {
        status: true,
        message: message || 'success',
        data,
      };
};
