'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import * as React from 'react';

type ConfirmType = 'warning' | 'info' | 'success' | 'danger' | 'default';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

const typeConfig: Record<ConfirmType, {
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  confirmVariant: 'default' | 'destructive' | 'outline';
}> = {
  warning: {
    icon: <AlertTriangle className="h-6 w-6" />,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    confirmVariant: 'default',
  },
  info: {
    icon: <Info className="h-6 w-6" />,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    confirmVariant: 'default',
  },
  success: {
    icon: <CheckCircle2 className="h-6 w-6" />,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    confirmVariant: 'default',
  },
  danger: {
    icon: <XCircle className="h-6 w-6" />,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800',
    confirmVariant: 'destructive',
  },
  default: {
    icon: <Info className="h-6 w-6" />,
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    confirmVariant: 'default',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title = '确认操作',
  message,
  confirmText = '确定',
  cancelText = '取消',
  type = 'warning',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const config = typeConfig[type];

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border animate-in zoom-in-95 duration-300',
          config.borderColor
        )}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={cn(
              'flex items-center justify-center rounded-full p-3',
              config.iconBg
            )}>
              <span className={cn(
                type === 'warning' && 'text-amber-600 dark:text-amber-400',
                type === 'info' && 'text-blue-600 dark:text-blue-400',
                type === 'success' && 'text-emerald-600 dark:text-emerald-400',
                type === 'danger' && 'text-red-600 dark:text-red-400',
                type === 'default' && 'text-gray-600 dark:text-gray-400'
              )}>
                {config.icon}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-lg font-medium"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={config.confirmVariant}
              className="flex-1 h-10 rounded-lg font-medium"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for using confirm dialog with Promise-like API
export function useConfirm() {
  const [state, setState] = React.useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: ConfirmType;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    title: '',
    message: '',
    confirmText: '确定',
    cancelText: '取消',
    type: 'warning',
    resolve: null,
  });

  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  React.useEffect(() => {
    resolveRef.current = state.resolve;
  }, [state.resolve]);

  const confirm = React.useCallback((
    message: string,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
      type?: ConfirmType;
    }
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        open: true,
        title: options?.title || '确认操作',
        message,
        confirmText: options?.confirmText || '确定',
        cancelText: options?.cancelText || '取消',
        type: options?.type || 'warning',
        resolve,
      });
    });
  }, []);

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      resolveRef.current?.(false);
    }
    setState((prev) => ({ ...prev, open }));
  }, []);

  const handleConfirm = React.useCallback(() => {
    resolveRef.current?.(true);
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    confirm,
    dialogProps: {
      open: state.open,
      onOpenChange: handleOpenChange,
      title: state.title,
      message: state.message,
      confirmText: state.confirmText,
      cancelText: state.cancelText,
      type: state.type,
      onConfirm: handleConfirm,
    },
  };
}