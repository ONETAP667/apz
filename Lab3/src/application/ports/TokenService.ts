export type TokenPayload = {
  userId: number;
  email: string;
  username: string;
};

export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
