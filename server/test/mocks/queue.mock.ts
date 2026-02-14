export const queueMock = {
  add: jest.fn(),
  getJob: jest.fn(),
  getWaiting: jest.fn(),
  getActive: jest.fn(),
  getCompleted: jest.fn(),
  getFailed: jest.fn(),
  getDelayed: jest.fn(),
  isPaused: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
};

export const createQueueMock = () => ({
  add: jest.fn(),
  getJob: jest.fn(),
  getWaiting: jest.fn(),
  getActive: jest.fn(),
  getCompleted: jest.fn(),
  getFailed: jest.fn(),
  getDelayed: jest.fn(),
  isPaused: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
});
