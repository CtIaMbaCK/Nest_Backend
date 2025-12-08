export class CreateUserDto {
  email: string;
  password: string;
  contact?: string;
  name?: string;
  guardianName?: string;
  guardianContact?: string;
}
