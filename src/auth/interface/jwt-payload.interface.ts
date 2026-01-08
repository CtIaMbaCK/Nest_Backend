export interface JwtPayload {
  sub: string;
  phoneNumber: string;
  role: string;
}

export interface JwtGuardInfo {
  name?: string;
  messsage?: string;
}
