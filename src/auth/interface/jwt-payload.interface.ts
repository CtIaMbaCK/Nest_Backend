export interface JwtPayload {
  sub: string;
  phoneNum: string;
  role: string;
}

export interface JwtGuardInfo {
  name?: string;
  messsage?: string;
}
