/**
 * validate(schema)
 *   Runs Zod schema.parse() against req.body.
 *   On failure, returns a 400 with a frontend-friendly structured error response
 *   so Flash Messages can display the exact field and issue.
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // parse() throws on failure; use safeParse for non-throwing variant
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      // ZodError has .errors array; generic errors fall back to .message
      const details = error.errors
        ? error.errors.map((e) => ({
            field: e.path.join(".") || "body",
            message: e.message
          }))
        : [{ field: "body", message: error.message }];

      const readableMessage = details.map((d) => `${d.field}: ${d.message}`).join(" | ");

      return res.status(400).json({
        success: false,
        message: readableMessage,
        error: "Validation failed",
        details
      });
    }
  };
};
