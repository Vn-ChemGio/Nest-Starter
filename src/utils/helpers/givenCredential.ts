export const givenCredentialWithEmail = (
  data?: Partial<{ credential: string; password: string }>,
) =>
  Object.assign(
    {
      credential: 'hantsy@example.com',
      password: 'mysecret',
    },
    data,
  );
export const givenCredentialWithUsername = (
  data?: Partial<{ credential: string; password: string }>,
) =>
  Object.assign(
    {
      credential: 'hantsy',
      password: 'mysecret',
    },
    data,
  );
