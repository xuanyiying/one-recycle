import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { DispatchController } from './dispatch.controller';
import { 
  createTestAxiosResponse,
  createMockHttpService 
} from '../../tests/test-utils';
import { of, throwError } from 'rxjs';

describe('DispatchController', () => {
  let controller: DispatchController;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispatchController],
      providers: [
        {
          provide: HttpService,
          useValue: createMockHttpService(),
        },
      ],
    }).compile();

    controller = module.get<DispatchController>(DispatchController);
    httpService = module.get(HttpService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('assignOrder', () => {
    it('should assign order successfully', async () => {
      const assignData = { orderId: 'order-1', courierId: 'courier-1' };
      const mockResponse = createTestAxiosResponse({ success: true, assignmentId: 'assignment-1' });
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await controller.assignOrder(assignData);

      expect(httpService.post).toHaveBeenCalledWith('http://dispatch-service:3006/dispatch/assign', assignData);
      expect(result).toEqual(of(mockResponse));
    });
  });

  describe('getAllAssignments', () => {
    it('should get all assignments successfully', async () => {
      const mockAssignments = [
        { 
          id: '1', 
          orderId: 'order-1', 
          courierId: 'courier-1', 
          status: 'assigned',
          createdAt: '2023-01-01T00:00:00Z'
        },
        { 
          id: '2', 
          orderId: 'order-2', 
          courierId: 'courier-2', 
          status: 'in_progress',
          createdAt: '2023-01-02T00:00:00Z'
        }
      ];
      const mockResponse = createTestAxiosResponse(mockAssignments);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await controller.getAllAssignments();

      expect(httpService.get).toHaveBeenCalledWith('http://dispatch-service:3006/dispatch/assignments');
      expect(result).toEqual(of(mockResponse));
    });
  });

  describe('getAssignment', () => {
    it('should get assignment by id successfully', async () => {
      const assignmentId = 'assignment-1';
      const mockAssignment = { 
        id: assignmentId, 
        orderId: 'order-1', 
        courierId: 'courier-1', 
        status: 'assigned',
        createdAt: '2023-01-01T00:00:00Z'
      };
      const mockResponse = createTestAxiosResponse(mockAssignment);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await controller.getAssignment(assignmentId);

      expect(httpService.get).toHaveBeenCalledWith(`http://dispatch-service:3006/dispatch/assignments/${assignmentId}`);
      expect(result).toEqual(of(mockResponse));
    });
  });

  describe('updateAssignmentStatus', () => {
    it('should update assignment status successfully', async () => {
      const assignmentId = 'assignment-1';
      const statusData = { status: 'in_progress' };
      const mockResponse = createTestAxiosResponse({ success: true });
      jest.spyOn(httpService, 'put').mockReturnValue(of(mockResponse));

      const result = await controller.updateAssignmentStatus(assignmentId, statusData);

      expect(httpService.put).toHaveBeenCalledWith(`http://dispatch-service:3006/dispatch/assignments/${assignmentId}/status`, statusData);
      expect(result).toEqual(of(mockResponse));
    });
  });

  describe('acceptAssignment', () => {
    it('should accept assignment successfully', async () => {
      const assignmentId = 'assignment-1';
      const mockResponse = createTestAxiosResponse({ success: true });
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await controller.acceptAssignment(assignmentId);

      expect(httpService.post).toHaveBeenCalledWith(`http://dispatch-service:3006/dispatch/assignments/${assignmentId}/accept`);
      expect(result).toEqual(of(mockResponse));
    });
  });

  describe('rejectAssignment', () => {
    it('should reject assignment successfully', async () => {
      const assignmentId = 'assignment-1';
      const mockResponse = createTestAxiosResponse({ success: true });
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await controller.rejectAssignment(assignmentId);

      expect(httpService.post).toHaveBeenCalledWith(`http://dispatch-service:3006/dispatch/assignments/${assignmentId}/reject`);
      expect(result).toEqual(of(mockResponse));
    });
  });
});