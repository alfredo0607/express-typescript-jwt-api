import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

interface RequestSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    if (schemas.params) req.params = schemas.params.parse(req.params) as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    if (schemas.query) req.query = schemas.query.parse(req.query) as any;
    next();
  };
}
