import { preSaveHook } from './preSaveHook';

describe('preSaveHook', () => {
  test('should execute next middleware when password is not modified and email & username does not provider', async () => {
    const nextMock = jest.fn();
    const contextMock = {
      isModified: jest.fn(),
    };
    contextMock.isModified.mockReturnValueOnce(false);
    await preSaveHook.call(contextMock, nextMock);
    expect(contextMock.isModified).toBeCalledWith('password');
    expect(nextMock).toBeCalledTimes(1);
  });

  test('should set password when password is modified', async () => {
    const nextMock = jest.fn();
    const contextMock = {
      isModified: jest.fn(),
      set: jest.fn(),
      password: '123456',
    };
    contextMock.isModified.mockReturnValueOnce(true);
    await preSaveHook.call(contextMock, nextMock);
    expect(contextMock.isModified).toBeCalledWith('password');
    expect(nextMock).toBeCalledTimes(1);
    expect(contextMock.set).toBeCalledTimes(1);
  });

  test('should set lowercase email if it include', async () => {
    const nextMock = jest.fn();
    const contextMock = {
      isModified: jest.fn(),
      set: jest.fn(),
      email: 'ANY_EMAIL@ABc.com',
    };
    contextMock.isModified.mockReturnValueOnce(false);

    await preSaveHook.call(contextMock, nextMock);

    expect(contextMock.set).toBeCalledTimes(1);
    expect(contextMock.set).toBeCalledWith(
      'email',
      contextMock.email.toLowerCase(),
    );
    expect(nextMock).toBeCalledTimes(1);
  });

  test('should set lowercase username if it include', async () => {
    const nextMock = jest.fn();
    const contextMock = {
      isModified: jest.fn(),
      set: jest.fn(),
      username: 'ANY_username',
    };
    contextMock.isModified.mockReturnValueOnce(false);

    await preSaveHook.call(contextMock, nextMock);

    expect(contextMock.set).toBeCalledTimes(1);
    expect(contextMock.set).toBeCalledWith(
      'username',
      contextMock.username.toLowerCase(),
    );
    expect(nextMock).toBeCalledTimes(1);
  });
});
