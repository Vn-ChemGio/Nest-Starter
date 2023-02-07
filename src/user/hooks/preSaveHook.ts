import * as bcrypt from 'bcrypt';

export async function preSaveHook(next) {
  if (this.isModified('password')) {
    // Hash the password
    const password = await bcrypt.hash(this.password, 10);
    this.set('password', password);
  }

  if (this.email) this.set('email', this.email.toLowerCase());

  if (this.username) this.set('username', this.username.toLowerCase());

  next();
}
