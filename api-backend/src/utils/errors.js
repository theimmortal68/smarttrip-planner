export function sendError(res, code, message, httpStatus = 400) {
  return res.status(httpStatus).json({
    error: {
      code,
      message,
    },
  });
}
