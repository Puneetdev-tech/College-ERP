export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const errorMessage = error.errors
        ? error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
        : error.message;
      return res.status(400).json({ success: false, message: errorMessage });
    }
  };
};
