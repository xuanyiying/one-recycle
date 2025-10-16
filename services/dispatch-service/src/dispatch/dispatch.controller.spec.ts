import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';

describe('DispatchController', () => {
  let controller: DispatchController;
  let dispatchService: DispatchService;

  const mockDispatchService = {
    assignOrder: jest.fn(),
    getAllAssignments: jest.fn(),
    getAssignment: jest.fn(),
    updateAssignmentStatus: jest.fn(),
    acceptAssignment: jest.fn(),
    rejectAssignment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispatchController],
      providers: [
        {
          provide: DispatchService,
          useValue: mockDispatchService,
        },
      ],
    }).compile();

    controller = module.get<DispatchController>(DispatchController);
    dispatchService = module.get<DispatchService>(DispatchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assignOrder', () => {
    it('should assign order successfully', async () => {
      const assignData = { orderId: 'order-123', courierId: 'courier-123' };
      const expectedResult = { 
        id: 'assign-123', 
        orderId: 'order-123', 
        courierId: 'courier-123', 
        status: 'assigned' 
      };

      mockDispatchService.assignOrder.mockResolvedValue(expectedResult);

      const result = await controller.assignOrder(assignData);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.assignOrder).toHaveBeenCalledWith('order-123', 'courier-123');
      expect(dispatchService.assignOrder).toHaveBeenCalledTimes(1);
    });

    it('should handle assignment with empty order ID', async () => {
      const assignData = { orderId: '', courierId: 'courier-123' };
      const expectedResult = { 
        id: 'assign-empty', 
        orderId: '', 
        courierId: 'courier-123', 
        status: 'assigned' 
      };

      mockDispatchService.assignOrder.mockResolvedValue(expectedResult);

      const result = await controller.assignOrder(assignData);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.assignOrder).toHaveBeenCalledWith('', 'courier-123');
    });

    it('should handle assignment with empty courier ID', async () => {
      const assignData = { orderId: 'order-123', courierId: '' };
      const expectedResult = { 
        id: 'assign-empty-courier', 
        orderId: 'order-123', 
        courierId: '', 
        status: 'assigned' 
      };

      mockDispatchService.assignOrder.mockResolvedValue(expectedResult);

      const result = await controller.assignOrder(assignData);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.assignOrder).toHaveBeenCalledWith('order-123', '');
    });

    it('should handle service error during assignment', async () => {
      const assignData = { orderId: 'order-123', courierId: 'courier-123' };
      const errorMessage = 'Assignment failed';

      mockDispatchService.assignOrder.mockRejectedValue(new Error(errorMessage));

      await expect(controller.assignOrder(assignData)).rejects.toThrow(errorMessage);
      expect(dispatchService.assignOrder).toHaveBeenCalledWith('order-123', 'courier-123');
    });

    it('should handle HTTP exception during assignment', async () => {
      const assignData = { orderId: 'order-123', courierId: 'courier-123' };
      const httpException = new HttpException('Service unavailable', HttpStatus.SERVICE_UNAVAILABLE);

      mockDispatchService.assignOrder.mockRejectedValue(httpException);

      await expect(controller.assignOrder(assignData)).rejects.toThrow(httpException);
      expect(dispatchService.assignOrder).toHaveBeenCalledWith('order-123', 'courier-123');
    });

    it('should handle malformed assignment data', async () => {
      const assignData = { orderId: null, courierId: undefined };
      const expectedResult = { 
        id: 'assign-malformed', 
        orderId: null, 
        courierId: undefined, 
        status: 'assigned' 
      };

      mockDispatchService.assignOrder.mockResolvedValue(expectedResult);

      const result = await controller.assignOrder(assignData);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.assignOrder).toHaveBeenCalledWith(null, undefined);
    });
  });

  describe('getAllAssignments', () => {
    it('should return all assignments', async () => {
      const expectedAssignments = [
        { id: 'assign-1', orderId: 'order-1', courierId: 'courier-1', status: 'assigned' },
        { id: 'assign-2', orderId: 'order-2', courierId: 'courier-2', status: 'completed' },
      ];

      mockDispatchService.getAllAssignments.mockResolvedValue(expectedAssignments);

      const result = await controller.getAllAssignments();

      expect(result).toEqual(expectedAssignments);
      expect(dispatchService.getAllAssignments).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no assignments exist', async () => {
      mockDispatchService.getAllAssignments.mockResolvedValue([]);

      const result = await controller.getAllAssignments();

      expect(result).toEqual([]);
      expect(dispatchService.getAllAssignments).toHaveBeenCalledTimes(1);
    });

    it('should handle service error when getting all assignments', async () => {
      const errorMessage = 'Failed to get assignments';
      mockDispatchService.getAllAssignments.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getAllAssignments()).rejects.toThrow(errorMessage);
      expect(dispatchService.getAllAssignments).toHaveBeenCalledTimes(1);
    });

    it('should handle HTTP exception when getting all assignments', async () => {
      const httpException = new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      mockDispatchService.getAllAssignments.mockRejectedValue(httpException);

      await expect(controller.getAllAssignments()).rejects.toThrow(httpException);
      expect(dispatchService.getAllAssignments).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAssignment', () => {
    it('should return assignment by ID', async () => {
      const assignmentId = 'assign-123';
      const expectedAssignment = { 
        id: assignmentId, 
        orderId: 'order-123', 
        courierId: 'courier-123', 
        status: 'assigned' 
      };

      mockDispatchService.getAssignment.mockResolvedValue(expectedAssignment);

      const result = await controller.getAssignment(assignmentId);

      expect(result).toEqual(expectedAssignment);
      expect(dispatchService.getAssignment).toHaveBeenCalledWith(assignmentId);
      expect(dispatchService.getAssignment).toHaveBeenCalledTimes(1);
    });

    it('should handle assignment not found', async () => {
      const assignmentId = 'non-existent';
      const httpException = new HttpException('Assignment not found', HttpStatus.NOT_FOUND);

      mockDispatchService.getAssignment.mockRejectedValue(httpException);

      await expect(controller.getAssignment(assignmentId)).rejects.toThrow(httpException);
      expect(dispatchService.getAssignment).toHaveBeenCalledWith(assignmentId);
    });

    it('should handle empty assignment ID', async () => {
      const assignmentId = '';
      const expectedAssignment = { 
        id: '', 
        orderId: 'order-123', 
        courierId: 'courier-123', 
        status: 'assigned' 
      };

      mockDispatchService.getAssignment.mockResolvedValue(expectedAssignment);

      const result = await controller.getAssignment(assignmentId);

      expect(result).toEqual(expectedAssignment);
      expect(dispatchService.getAssignment).toHaveBeenCalledWith('');
    });

    it('should handle service error when getting assignment', async () => {
      const assignmentId = 'assign-123';
      const errorMessage = 'Database connection failed';

      mockDispatchService.getAssignment.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getAssignment(assignmentId)).rejects.toThrow(errorMessage);
      expect(dispatchService.getAssignment).toHaveBeenCalledWith(assignmentId);
    });
  });

  describe('updateAssignmentStatus', () => {
    it('should update assignment status successfully', async () => {
      const assignmentId = 'assign-123';
      const statusData = { status: 'completed' };
      const expectedResult = { id: assignmentId, status: 'completed' };

      mockDispatchService.updateAssignmentStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateAssignmentStatus(assignmentId, statusData);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.updateAssignmentStatus).toHaveBeenCalledWith(assignmentId, 'completed');
      expect(dispatchService.updateAssignmentStatus).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid status update', async () => {
      const assignmentId = 'assign-123';
      const statusData = { status: 'invalid-status' };
      const httpException = new HttpException('Invalid status', HttpStatus.BAD_REQUEST);

      mockDispatchService.updateAssignmentStatus.mockRejectedValue(httpException);

      await expect(controller.updateAssignmentStatus(assignmentId, statusData)).rejects.toThrow(httpException);
      expect(dispatchService.updateAssignmentStatus).toHaveBeenCalledWith(assignmentId, 'invalid-status');
    });

    it('should handle empty status', async () => {
      const assignmentId = 'assign-123';
      const statusData = { status: '' };
      const expectedResult = { id: assignmentId, status: '' };

      mockDispatchService.updateAssignmentStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateAssignmentStatus(assignmentId, statusData);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.updateAssignmentStatus).toHaveBeenCalledWith(assignmentId, '');
    });

    it('should handle null status', async () => {
      const assignmentId = 'assign-123';
      const statusData = { status: null };
      const expectedResult = { id: assignmentId, status: null };

      mockDispatchService.updateAssignmentStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateAssignmentStatus(assignmentId, statusData);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.updateAssignmentStatus).toHaveBeenCalledWith(assignmentId, null);
    });

    it('should handle service error during status update', async () => {
      const assignmentId = 'assign-123';
      const statusData = { status: 'completed' };
      const errorMessage = 'Update failed';

      mockDispatchService.updateAssignmentStatus.mockRejectedValue(new Error(errorMessage));

      await expect(controller.updateAssignmentStatus(assignmentId, statusData)).rejects.toThrow(errorMessage);
      expect(dispatchService.updateAssignmentStatus).toHaveBeenCalledWith(assignmentId, 'completed');
    });
  });

  describe('acceptAssignment', () => {
    it('should accept assignment successfully', async () => {
      const assignmentId = 'assign-123';
      const expectedResult = { 
        id: assignmentId, 
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      };

      mockDispatchService.acceptAssignment.mockResolvedValue(expectedResult);

      const result = await controller.acceptAssignment(assignmentId);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.acceptAssignment).toHaveBeenCalledWith(assignmentId);
      expect(dispatchService.acceptAssignment).toHaveBeenCalledTimes(1);
    });

    it('should handle assignment not found during accept', async () => {
      const assignmentId = 'non-existent';
      const httpException = new HttpException('Assignment not found', HttpStatus.NOT_FOUND);

      mockDispatchService.acceptAssignment.mockRejectedValue(httpException);

      await expect(controller.acceptAssignment(assignmentId)).rejects.toThrow(httpException);
      expect(dispatchService.acceptAssignment).toHaveBeenCalledWith(assignmentId);
    });

    it('should handle already accepted assignment', async () => {
      const assignmentId = 'assign-123';
      const httpException = new HttpException('Assignment already accepted', HttpStatus.CONFLICT);

      mockDispatchService.acceptAssignment.mockRejectedValue(httpException);

      await expect(controller.acceptAssignment(assignmentId)).rejects.toThrow(httpException);
      expect(dispatchService.acceptAssignment).toHaveBeenCalledWith(assignmentId);
    });

    it('should handle empty assignment ID during accept', async () => {
      const assignmentId = '';
      const expectedResult = { 
        id: '', 
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      };

      mockDispatchService.acceptAssignment.mockResolvedValue(expectedResult);

      const result = await controller.acceptAssignment(assignmentId);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.acceptAssignment).toHaveBeenCalledWith('');
    });
  });

  describe('rejectAssignment', () => {
    it('should reject assignment successfully', async () => {
      const assignmentId = 'assign-123';
      const expectedResult = { 
        id: assignmentId, 
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      };

      mockDispatchService.rejectAssignment.mockResolvedValue(expectedResult);

      const result = await controller.rejectAssignment(assignmentId);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.rejectAssignment).toHaveBeenCalledWith(assignmentId);
      expect(dispatchService.rejectAssignment).toHaveBeenCalledTimes(1);
    });

    it('should handle assignment not found during reject', async () => {
      const assignmentId = 'non-existent';
      const httpException = new HttpException('Assignment not found', HttpStatus.NOT_FOUND);

      mockDispatchService.rejectAssignment.mockRejectedValue(httpException);

      await expect(controller.rejectAssignment(assignmentId)).rejects.toThrow(httpException);
      expect(dispatchService.rejectAssignment).toHaveBeenCalledWith(assignmentId);
    });

    it('should handle already rejected assignment', async () => {
      const assignmentId = 'assign-123';
      const httpException = new HttpException('Assignment already rejected', HttpStatus.CONFLICT);

      mockDispatchService.rejectAssignment.mockRejectedValue(httpException);

      await expect(controller.rejectAssignment(assignmentId)).rejects.toThrow(httpException);
      expect(dispatchService.rejectAssignment).toHaveBeenCalledWith(assignmentId);
    });

    it('should handle empty assignment ID during reject', async () => {
      const assignmentId = '';
      const expectedResult = { 
        id: '', 
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      };

      mockDispatchService.rejectAssignment.mockResolvedValue(expectedResult);

      const result = await controller.rejectAssignment(assignmentId);

      expect(result).toEqual(expectedResult);
      expect(dispatchService.rejectAssignment).toHaveBeenCalledWith('');
    });
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have dispatchService injected', () => {
      expect(dispatchService).toBeDefined();
    });
  });
});