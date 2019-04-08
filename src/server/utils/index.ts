import {NextFunction, Request, RequestHandler, Response} from "express";

import {STATUS_CODES} from 'http';

export const isAsyncFunction = (() => {
  const AsyncFunction = (async () => {
  }).constructor;
  return function(fun: Function) {
    return fun instanceof AsyncFunction;
  };
})();

export const asyncMiddleware = function(fun: RequestHandler): RequestHandler {
  if (isAsyncFunction(fun)) {
    return function(req: Request, res: Response, next: NextFunction) {
      Promise.resolve(fun(req, res, next)).catch(next);
    };
  }
  return fun;
};

export const cloneFields = function(obj: any, fields: string[]) {
  const result: any = {};
  for (const field of fields) {
    if (undefined !== obj[field]) {
      result[field] = obj[field];
    }
  }
  return result;
};

export const respondWith = function(res: Response, status: number, msg?: string) {
  res.status(status).send(msg || STATUS_CODES[status]);
};

export const respondErrorPage = function(res: Response, errorCode: number) {
  res.status(errorCode);
  res.render(String(errorCode), {}, function(err, html) {
    if (err) {
      return respondWith(res, errorCode);
    }
    res.send(html);
  });
};