import * as bcrypt from 'bcrypt';

// Increased from 10 to 12 for better security
const saltRounds = 12;

export const helpHashPassword = async (
  plainPassword: string,
): Promise<string> => {
  try {
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    return hash;
  } catch (error) {
    throw new Error(`Lỗi mã hóa mật khẩu: ${error}`);
  }
};

export const helpComparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (err) {
    throw new Error(`Lỗi ${err}`);
  }
};
