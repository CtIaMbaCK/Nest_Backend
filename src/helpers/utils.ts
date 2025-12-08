import * as bcrypt from 'bcrypt';
const salt = 20;

export const helpHashPassword = async (
  plaintPassword: string,
): Promise<any> => {
  try {
    const hash = await bcrypt.hash(plaintPassword, salt);
    console.log('hashPassword: ', hash);
    return hash;
  } catch (error) {
    throw new Error(`Có lỗi xảy ra: ${error}`);
  }
};
