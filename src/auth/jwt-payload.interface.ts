// Every token names its purpose, so a refresh or password-reset token can
// never be used where an access token is expected.
export type TokenType = 'access' | 'refresh' | 'reset';

export interface JwtPayload {
  username: string;
  typ: TokenType;
}
