import { EmailTemplate } from '@mail/entities';

export const givenEmailTemplate = (data?: Partial<EmailTemplate>) =>
  Object.assign(
    {
      name: 'Welcome new user',
      adapter: 'hbs',
      from: 'vn.chemgio@yahoo.com',
      subject: 'Welcome new user',
      content: 'any_content',
    },
    data,
  ) as EmailTemplate;
export const givenEmailTemplateWithId = (
  data?: Partial<EmailTemplate & { _id?: string }>,
) =>
  Object.assign(
    {
      ...givenEmailTemplate(),
      _id: '123',
    },
    data,
  ) as EmailTemplate;
