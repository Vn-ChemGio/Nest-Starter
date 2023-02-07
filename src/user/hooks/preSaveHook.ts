import * as bcrypt from 'bcrypt';

function reverse(s) {
  return s.split('').reverse().join('');
}

export async function preSaveHook(next) {
  if (this.isModified('password')) {
    // Hash the password
    const password = await bcrypt.hash(this.password, 10);
    this.set('password', password);
  }

  if (this.refreshToken) {
    // Hash the refreshToken because bcrypt only has limit length of token
    const refreshTokenStored = await bcrypt.hash(
      reverse(this.refreshToken),
      10,
    );
    this.set('refreshToken', refreshTokenStored);
  }

  if (this.email) this.set('email', this.email.toLowerCase());

  if (this.username) this.set('username', this.username.toLowerCase());

  next();
}
