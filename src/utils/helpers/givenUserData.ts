import { User } from '@user/entities';

export const givenUserData = (data?: Partial<User>) =>
  Object.assign(
    {
      username: 'hantsy',
      email: 'hantsy@example.com',
      password: 'mysecret',
    },
    data,
  ) as User;

export const givenUserDataWithId = (data?: Partial<User & { _id?: string }>) =>
  Object.assign(
    {
      ...givenUserData(),
      _id: '123',
    },
    data,
  ) as User;
