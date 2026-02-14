export const inventoryServiceMock = {
  checkInventory: jest.fn(),
  lockInventory: jest.fn(),
  releaseInventory: jest.fn(),
  createFromOrder: jest.fn(),
};

export const createInventoryServiceMock = () => ({
  checkInventory: jest.fn(),
  lockInventory: jest.fn(),
  releaseInventory: jest.fn(),
  createFromOrder: jest.fn(),
});
