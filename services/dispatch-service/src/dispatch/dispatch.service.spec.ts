import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { JdExpressService } from '../jd-express/jd-express.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

// Mock axios.create to return our mock instance
mockedAxios.create = jest.fn(() => mockAxiosInstance as any);

describe('DispatchService', () => {
  let service: DispatchService;
  let jdExpressService: JdExpressService;

  const mockJdExpressService = {
    createPickup: jest.fn(),
    cancelPickup: jest.fn(),
    queryWaybill: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        {
          provide: JdExpressService,
          useValue: mockJdExpressService,
        },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
    jdExpressService = module.get<JdExpressService>(JdExpressService);

    // Reset mocks
    jest.clearAllMocks();
    mockAxiosInstance.get.mockClear();
    mockAxiosInstance.post.mockClear();
    mockAxiosInstance.put.mockClear();
    
    // Mock environment variables
    process.env.ORDER_SERVICE_URL = 'http://localhost:3001';
    process.env.COURIER_SERVICE_URL = 'http://localhost:3002';
  });

  describe('assignOrder', () => {
    it('should assign order successfully', async () => {
      const orderId = 'order-123';
      const courierId = 'courier-123';
      
      // Mock order service response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
          address: '123 Test St',
        },
      });

      // Mock courier service response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      // Mock order update response
      mockAxiosInstance.put.mockResolvedValueOnce({
        data: { id: orderId, status: 'assigned' },
      });

      // Mock courier notification response
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { success: true, message: 'Notification sent' },
      });

      const result = await service.assignOrder(orderId, courierId);

      expect(result).toEqual({
        id: expect.any(String),
        orderId,
        courierId,
        status: 'assigned',
        assignedAt: expect.any(Date),
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      expect(mockAxiosInstance.put).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it('should handle order not found', async () => {
      const orderId = 'non-existent';
      const courierId = 'courier-123';

      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Order not found' } },
      });

      await expect(service.assignOrder(orderId, courierId)).rejects.toThrow(
        'Order not found'
      );

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should handle courier not found', async () => {
      const orderId = 'order-123';
      const courierId = 'non-existent';

      // Mock order service response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      // Mock courier service error
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Courier not found' } },
      });

      await expect(service.assignOrder(orderId, courierId)).rejects.toThrow(
        'Courier not found'
      );

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should handle courier unavailable', async () => {
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock order service response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      // Mock courier service response with unavailable status
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'busy',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      await expect(service.assignOrder(orderId, courierId)).rejects.toThrow(
        'Courier is not available'
      );

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should handle order already assigned', async () => {
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock order service response with assigned status
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          id: orderId,
          status: 'assigned',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      await expect(service.assignOrder(orderId, courierId)).rejects.toThrow(
        'Order is already assigned'
      );

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should handle network error during assignment', async () => {
      const orderId = 'order-123';
      const courierId = 'courier-123';

      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.assignOrder(orderId, courierId)).rejects.toThrow(
        'Network error'
      );

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should retry assignment on failure', async () => {
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock order service response
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      // Mock courier service response
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      // Mock order update to fail first time, succeed second time
      mockAxiosInstance.put
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          data: { id: orderId, status: 'assigned' },
        });

      // Mock courier notification response
      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, message: 'Notification sent' },
      });

      const result = await service.assignOrder(orderId, courierId);

      expect(result).toEqual({
        id: expect.any(String),
        orderId,
        courierId,
        status: 'assigned',
        assignedAt: expect.any(Date),
      });

      expect(mockAxiosInstance.put).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllAssignments', () => {
    it('should return all assignments', async () => {
      const result = await service.getAllAssignments();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should return assignments with correct structure', async () => {
      // Add some test assignments first
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock successful assignment
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      mockAxiosInstance.put.mockResolvedValue({
        data: { id: orderId, status: 'assigned' },
      });

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, message: 'Notification sent' },
      });

      await service.assignOrder(orderId, courierId);

      const result = await service.getAllAssignments();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('orderId');
      expect(result[0]).toHaveProperty('courierId');
      expect(result[0]).toHaveProperty('status');
      expect(result[0]).toHaveProperty('assignedAt');
    });
  });

  describe('getAssignment', () => {
    it('should return assignment by ID', async () => {
      // First create an assignment
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock successful assignment
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      mockAxiosInstance.put.mockResolvedValue({
        data: { id: orderId, status: 'assigned' },
      });

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, message: 'Notification sent' },
      });

      const assignment = await service.assignOrder(orderId, courierId);
      const result = await service.getAssignment(assignment.id);

      expect(result).toEqual(assignment);
      expect(result.id).toBe(assignment.id);
      expect(result.orderId).toBe(orderId);
      expect(result.courierId).toBe(courierId);
    });

    it('should throw error for non-existent assignment', async () => {
      const nonExistentId = 'non-existent-id';

      await expect(service.getAssignment(nonExistentId)).rejects.toThrow(
        'Assignment not found'
      );
    });

    it('should handle empty assignment ID', async () => {
      await expect(service.getAssignment('')).rejects.toThrow(
        'Assignment not found'
      );
    });

    it('should handle null assignment ID', async () => {
      await expect(service.getAssignment(null)).rejects.toThrow(
        'Assignment not found'
      );
    });
  });

  describe('updateAssignmentStatus', () => {
    it('should update assignment status successfully', async () => {
      // First create an assignment
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock successful assignment
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      mockAxiosInstance.put.mockResolvedValue({
        data: { id: orderId, status: 'assigned' },
      });

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, message: 'Notification sent' },
      });

      const assignment = await service.assignOrder(orderId, courierId);
      const newStatus = 'in_progress';

      const result = await service.updateAssignmentStatus(assignment.id, newStatus);

      expect(result.id).toBe(assignment.id);
      expect(result.status).toBe(newStatus);
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw error for non-existent assignment during status update', async () => {
      const nonExistentId = 'non-existent-id';
      const newStatus = 'completed';

      await expect(service.updateAssignmentStatus(nonExistentId, newStatus)).rejects.toThrow(
        'Assignment not found'
      );
    });

    it('should handle invalid status values', async () => {
      // First create an assignment
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock successful assignment
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      mockAxiosInstance.put.mockResolvedValue({
        data: { id: orderId, status: 'assigned' },
      });

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, message: 'Notification sent' },
      });

      const assignment = await service.assignOrder(orderId, courierId);
      const invalidStatus = 'invalid-status';

      await expect(service.updateAssignmentStatus(assignment.id, invalidStatus)).rejects.toThrow(
        'Invalid status'
      );
    });

    it('should handle empty status', async () => {
      // First create an assignment
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock successful assignment
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      mockAxiosInstance.put.mockResolvedValue({
        data: { id: orderId, status: 'assigned' },
      });

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, message: 'Notification sent' },
      });

      const assignment = await service.assignOrder(orderId, courierId);

      await expect(service.updateAssignmentStatus(assignment.id, '')).rejects.toThrow(
        'Invalid status'
      );
    });
  });

  describe('acceptAssignment', () => {
    it('should accept assignment successfully', async () => {
      // First create an assignment
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock successful assignment
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      mockAxiosInstance.put.mockResolvedValue({
        data: { id: orderId, status: 'assigned' },
      });

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, message: 'Notification sent' },
      });

      const assignment = await service.assignOrder(orderId, courierId);
      const result = await service.acceptAssignment(assignment.id);

      expect(result.id).toBe(assignment.id);
      expect(result.status).toBe('accepted');
      expect(result.acceptedAt).toBeDefined();
    });

    it('should throw error for non-existent assignment during accept', async () => {
      const nonExistentId = 'non-existent-id';

      await expect(service.acceptAssignment(nonExistentId)).rejects.toThrow(
        'Assignment not found'
      );
    });

    it('should handle already accepted assignment', async () => {
      // First create and accept an assignment
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock successful assignment
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      mockAxiosInstance.put.mockResolvedValue({
        data: { id: orderId, status: 'assigned' },
      });

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true, message: 'Notification sent' },
      });

      const assignment = await service.assignOrder(orderId, courierId);
      await service.acceptAssignment(assignment.id);

      // Try to accept again
      await expect(service.acceptAssignment(assignment.id)).rejects.toThrow(
        'Assignment already accepted'
      );
    });
  });

  describe('rejectAssignment', () => {
    it('should reject assignment successfully', async () => {
      // First create an assignment
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock successful assignment
      mockedAxios.get.mockResolvedValue({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      mockedAxios.get.mockResolvedValue({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      mockedAxios.put.mockResolvedValue({
        data: { id: orderId, status: 'assigned' },
      });

      mockedAxios.post.mockResolvedValue({
        data: { success: true, message: 'Notification sent' },
      });

      const assignment = await service.assignOrder(orderId, courierId);
      const result = await service.rejectAssignment(assignment.id);

      expect(result.id).toBe(assignment.id);
      expect(result.status).toBe('rejected');
      expect(result.rejectedAt).toBeDefined();
    });

    it('should throw error for non-existent assignment during reject', async () => {
      const nonExistentId = 'non-existent-id';

      await expect(service.rejectAssignment(nonExistentId)).rejects.toThrow(
        'Assignment not found'
      );
    });

    it('should handle already rejected assignment', async () => {
      // First create and reject an assignment
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock successful assignment
      mockedAxios.get.mockResolvedValue({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
        },
      });

      mockedAxios.get.mockResolvedValue({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      mockedAxios.put.mockResolvedValue({
        data: { id: orderId, status: 'assigned' },
      });

      mockedAxios.post.mockResolvedValue({
        data: { success: true, message: 'Notification sent' },
      });

      const assignment = await service.assignOrder(orderId, courierId);
      await service.rejectAssignment(assignment.id);

      // Try to reject again
      await expect(service.rejectAssignment(assignment.id)).rejects.toThrow(
        'Assignment already rejected'
      );
    });
  });

  describe('integration with external services', () => {
    it('should handle courier service notification during assignment', async () => {
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock order service response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
          address: '123 Test St',
        },
      });

      // Mock courier service response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      // Mock order update response
      mockAxiosInstance.put.mockResolvedValueOnce({
        data: { id: orderId, status: 'assigned' },
      });

      // Mock courier notification response
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { success: true, message: 'Notification sent' },
      });

      const result = await service.assignOrder(orderId, courierId);

      expect(result).toBeDefined();
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.stringContaining('/courier/notifications'),
        expect.any(Object)
      );
    });

    it('should handle courier service notification failure during assignment', async () => {
      const orderId = 'order-123';
      const courierId = 'courier-123';

      // Mock order service response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          id: orderId,
          status: 'pending',
          items: [{ name: 'Item 1', quantity: 1 }],
          address: '123 Test St',
        },
      });

      // Mock courier service response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          id: courierId,
          name: 'John Doe',
          status: 'available',
          location: { lat: 40.7128, lng: -74.0060 },
        },
      });

      // Mock order update response
      mockAxiosInstance.put.mockResolvedValueOnce({
        data: { id: orderId, status: 'assigned' },
      });

      // Mock courier notification failure
        mockAxiosInstance.post.mockRejectedValueOnce(new Error('Notification service unavailable'));

      await expect(service.assignOrder(orderId, courierId)).rejects.toThrow(
        'Notification service unavailable'
      );
    });
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have jdExpressService injected', () => {
      expect(jdExpressService).toBeDefined();
    });
  });
});