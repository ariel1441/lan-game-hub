export type SuccessResponse<T> = {
  ok: true;
  data: T;
};

export type ErrorResponse = {
  ok: false;
  error: string;
};

export type ServiceResponse<T> = SuccessResponse<T> | ErrorResponse;
