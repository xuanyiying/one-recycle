export const paymentGatewayMock = {
  pay: jest.fn(),
  refund: jest.fn(),
  transfer: jest.fn(),
};

export const createPaymentGatewayMock = () => ({
  pay: jest.fn(),
  refund: jest.fn(),
  transfer: jest.fn(),
});
