import { logger } from './logger'
import Taro from '@tarojs/taro';
import { v4 as uuidv4 } from 'uuid';

/**
 *
 * Sync Queue System
 * Manages offline operations and syncs them when online
 */

export enum OperationType {
    CREATE_ORDER = 'CREATE_ORDER',
    UPDATE_ORDER = 'UPDATE_ORDER',
    CANCEL_ORDER = 'CANCEL_ORDER',
    CREATE_ADDRESS = 'CREATE_ADDRESS',
    UPDATE_ADDRESS = 'UPDATE_ADDRESS',
    DELETE_ADDRESS = 'DELETE_ADDRESS',
    UPDATE_PROFILE = 'UPDATE_PROFILE',
}

export enum OperationStatus {
    PENDING = 'PENDING',
    SYNCING = 'SYNCING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export interface SyncOperation {
    id: string;
    type: OperationType;
    data: any;
    status: OperationStatus;
    retryCount: number;
    maxRetries: number;
    createdAt: number;
    lastAttemptAt?: number;
    error?: string;
}

interface SyncQueueOptions {
    maxRetries?: number;
    retryDelay?: number;
    onSync?: (operation: SyncOperation) => void;
    onSuccess?: (operation: SyncOperation) => void;
    onError?: (operation: SyncOperation, error: Error) => void;
}

class SyncQueue {
    private readonly QUEUE_KEY = 'sync_queue';
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 2000; // 2 seconds
    private queue: SyncOperation[] = [];
    private isSyncing = false;
    private options: SyncQueueOptions = {};

    constructor(options: SyncQueueOptions = {}) {
        this.options = {
            maxRetries: options.maxRetries || this.MAX_RETRIES,
            retryDelay: options.retryDelay || this.RETRY_DELAY,
            ...options,
        };
        this.loadQueue().then(r => logger.log('loadQueue', r));
    }

    /**
     * Add operation to sync queue
     */
    async addOperation(
        type: OperationType,
        data: any,
        maxRetries?: number
    ): Promise<string> {
        const operation: SyncOperation = {
            id: this.generateId(),
            type,
            data,
            status: OperationStatus.PENDING,
            retryCount: 0,
            maxRetries: maxRetries || this.options.maxRetries || this.MAX_RETRIES,
            createdAt: Date.now(),
        };

        this.queue.push(operation);
        await this.saveQueue();

        // Try to sync immediately if online
        if (this.isOnline()) {
            await this.processQueue();
        }

        return operation.id;
    }

    /**
     * Process all pending operations in queue
     */
    async processQueue(): Promise<void> {
        if (this.isSyncing || !this.isOnline()) {
            return;
        }

        this.isSyncing = true;

        try {
            const pendingOps = this.queue.filter(
                op => op.status === OperationStatus.PENDING || op.status === OperationStatus.FAILED
            );

            for (const operation of pendingOps) {
                await this.processOperation(operation);
            }
        } finally {
            this.isSyncing = false;
            await this.saveQueue();
        }
    }

    /**
     * Process a single operation
     */
    private async processOperation(operation: SyncOperation): Promise<void> {
        if (operation.retryCount >= operation.maxRetries) {
            logger.error(`Operation ${operation.id} exceeded max retries`);
            return;
        }

        operation.status = OperationStatus.SYNCING;
        operation.lastAttemptAt = Date.now();
        operation.retryCount++;

        if (this.options.onSync) {
            this.options.onSync(operation);
        }

        try {
            await this.executeOperation(operation);

            operation.status = OperationStatus.COMPLETED;

            if (this.options.onSuccess) {
                this.options.onSuccess(operation);
            }

            // Remove completed operation from queue
            this.queue = this.queue.filter(op => op.id !== operation.id);
        } catch (error) {
            logger.error(`Failed to sync operation ${operation.id}:`, error);

            operation.status = OperationStatus.FAILED;
            operation.error = error instanceof Error ? error.message : String(error);

            if (this.options.onError) {
                this.options.onError(operation, error as Error);
            }

            // Retry after delay if not exceeded max retries
            if (operation.retryCount < operation.maxRetries) {
                await this.delay(this.options.retryDelay || this.RETRY_DELAY);
                operation.status = OperationStatus.PENDING;
            }
        }
    }

    /**
     * Execute operation based on type
     */
    private async executeOperation(operation: SyncOperation): Promise<void> {
        // Import services dynamically to avoid circular dependencies
        const orderService = await import('../services/order');

        switch (operation.type) {
            case OperationType.CREATE_ORDER:
                await orderService.createOrder(operation.data);
                break;

            case OperationType.UPDATE_ORDER:
                // Update order is not yet implemented in order service
                logger.warn('Update order operation not yet implemented');
                break;

            case OperationType.CANCEL_ORDER:
                await orderService.cancelOrder(operation.data.id);
                break;

            case OperationType.CREATE_ADDRESS:
            case OperationType.UPDATE_ADDRESS:
            case OperationType.DELETE_ADDRESS:
            case OperationType.UPDATE_PROFILE:
                // Address and profile operations will be implemented when those services are enhanced
                logger.warn(`Operation ${operation.type} not yet implemented`);
                break;

            default:
                throw new Error(`Unknown operation type: ${operation.type}`);
        }
    }

    /**
     * Get all operations in queue
     */
    getQueue(): SyncOperation[] {
        return [...this.queue];
    }

    /**
     * Get pending operations count
     */
    getPendingCount(): number {
        return this.queue.filter(
            op => op.status === OperationStatus.PENDING || op.status === OperationStatus.FAILED
        ).length;
    }

    /**
     * Get operation by ID
     */
    getOperation(id: string): SyncOperation | undefined {
        return this.queue.find(op => op.id === id);
    }

    /**
     * Remove operation from queue
     */
    async removeOperation(id: string): Promise<boolean> {
        const initialLength = this.queue.length;
        this.queue = this.queue.filter(op => op.id !== id);

        if (this.queue.length < initialLength) {
            await this.saveQueue();
            return true;
        }

        return false;
    }

    /**
     * Clear all completed operations
     */
    async clearCompleted(): Promise<void> {
        this.queue = this.queue.filter(op => op.status !== OperationStatus.COMPLETED);
        await this.saveQueue();
    }

    /**
     * Clear entire queue
     */
    async clearAll(): Promise<void> {
        this.queue = [];
        await this.saveQueue();
    }

    /**
     * Retry failed operations
     */
    async retryFailed(): Promise<void> {
        const failedOps = this.queue.filter(op => op.status === OperationStatus.FAILED);

        for (const op of failedOps) {
            op.status = OperationStatus.PENDING;
            op.retryCount = 0;
            op.error = undefined;
        }

        await this.saveQueue();
        await this.processQueue();
    }

    /**
     * Check if currently syncing
     */
    isSyncInProgress(): boolean {
        return this.isSyncing;
    }

    /**
     * Load queue from storage
     */
    private async loadQueue(): Promise<void> {
        try {
            const result = await Taro.getStorage({ key: this.QUEUE_KEY });
            this.queue = JSON.parse(result.data) || [];
        } catch (error) {
            this.queue = [];
        }
    }

    /**
     * Save queue to storage
     */
    private async saveQueue(): Promise<void> {
        try {
            await Taro.setStorage({
                key: this.QUEUE_KEY,
                data: JSON.stringify(this.queue),
            });
        } catch (error) {
            logger.error('Failed to save sync queue:', error);
        }
    }

    /**
     * Check if device is online
     */
    private isOnline(): boolean {
        try {
            // Import NetworkStatusManager dynamically to avoid circular dependency
            const { default: networkStatusManager } = require('./networkStatus');
            return networkStatusManager.isConnected();
        } catch (error) {
            // Fallback: assume online if NetworkStatusManager is not available
            return true;
        }
    }

    /**
     * Generate unique ID for operation use uuid library
     */
    private generateId(): string {
        return uuidv4();
    }

    /**
     * Delay helper
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
const syncQueue = new SyncQueue({
    onSync: (operation) => {
        logger.log(`Syncing operation: ${operation.type}`);
    },
    onSuccess: (operation) => {
        logger.log(`Successfully synced: ${operation.type}`);
        Taro.showToast({
            title: '数据已同步',
            icon: 'success',
            duration: 1500,
        });
    },
    onError: (operation, error) => {
        logger.error(`Failed to sync ${operation.type}:`, error);
        if (operation.retryCount >= operation.maxRetries) {
            Taro.showToast({
                title: '同步失败，请稍后重试',
                icon: 'none',
                duration: 2000,
            });
        }
    },
});

export default syncQueue;
