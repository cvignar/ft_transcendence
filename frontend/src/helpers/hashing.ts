import bcrypt from 'bcryptjs';

export const salt = bcrypt.genSaltSync(5);
console.log('salt generate');
