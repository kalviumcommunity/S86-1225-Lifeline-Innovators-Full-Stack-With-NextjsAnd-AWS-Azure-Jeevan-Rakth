import { toast as sonnerToast } from "sonner";

/**
 * Custom Toast Hook - Wrapper around Sonner
 *
 * Provides consistent toast notifications across the application
 * All toasts include proper accessibility attributes
 *
 * Usage:
 * const toast = useToast();
 * toast.success('Operation successful!');
 * toast.error('Something went wrong!');
 */

export interface ToastOptions {
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  return {
    /**
     * Success Toast - Green checkmark icon
     * Use for: Successful operations, confirmations
     */
    success: (message: string, options?: ToastOptions) => {
      sonnerToast.success(message, {
        duration: options?.duration || 4000,
        description: options?.description,
        action: options?.action,
        className: "toast-success",
      });
    },

    /**
     * Error Toast - Red X icon
     * Use for: Failed operations, validation errors
     */
    error: (message: string, options?: ToastOptions) => {
      sonnerToast.error(message, {
        duration: options?.duration || 5000,
        description: options?.description,
        action: options?.action,
        className: "toast-error",
      });
    },

    /**
     * Info Toast - Blue info icon
     * Use for: General information, tips
     */
    info: (message: string, options?: ToastOptions) => {
      sonnerToast.info(message, {
        duration: options?.duration || 4000,
        description: options?.description,
        action: options?.action,
        className: "toast-info",
      });
    },

    /**
     * Warning Toast - Yellow warning icon
     * Use for: Warnings, important notices
     */
    warning: (message: string, options?: ToastOptions) => {
      sonnerToast.warning(message, {
        duration: options?.duration || 4000,
        description: options?.description,
        action: options?.action,
        className: "toast-warning",
      });
    },

    /**
     * Loading Toast - Spinner icon
     * Use for: Long-running operations
     * Returns toast ID that can be used to dismiss or update
     */
    loading: (message: string, options?: Omit<ToastOptions, "action">) => {
      return sonnerToast.loading(message, {
        duration: options?.duration || Infinity,
        description: options?.description,
        className: "toast-loading",
      });
    },

    /**
     * Promise Toast - Automatically shows loading/success/error
     * Use for: Async operations
     */
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ) => {
      return sonnerToast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      });
    },

    /**
     * Dismiss a specific toast by ID
     */
    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId);
    },

    /**
     * Custom toast with full control
     */
    custom: (
      message: string,
      options?: ToastOptions & { icon?: React.ReactNode }
    ) => {
      sonnerToast(message, {
        duration: options?.duration || 4000,
        description: options?.description,
        action: options?.action,
        icon: options?.icon,
      });
    },
  };
}

/**
 * Common Toast Patterns
 * Pre-configured toasts for common scenarios
 */
export const commonToasts = {
  /**
   * Save Operations
   */
  saveSuccess: () => {
    sonnerToast.success("Saved successfully!", {
      description: "Your changes have been saved.",
    });
  },

  saveError: () => {
    sonnerToast.error("Failed to save", {
      description: "Please try again later.",
    });
  },

  /**
   * Delete Operations
   */
  deleteSuccess: (itemName?: string) => {
    sonnerToast.success("Deleted successfully!", {
      description: itemName
        ? `${itemName} has been deleted.`
        : "Item has been deleted.",
    });
  },

  deleteError: () => {
    sonnerToast.error("Failed to delete", {
      description: "Please try again later.",
    });
  },

  /**
   * Copy Operations
   */
  copySuccess: () => {
    sonnerToast.success("Copied to clipboard!", {
      duration: 2000,
    });
  },

  /**
   * Form Validation
   */
  validationError: (message?: string) => {
    sonnerToast.error("Validation Error", {
      description: message || "Please check your input and try again.",
    });
  },

  /**
   * Network Errors
   */
  networkError: () => {
    sonnerToast.error("Network Error", {
      description: "Please check your internet connection.",
    });
  },

  /**
   * Unauthorized Access
   */
  unauthorized: () => {
    sonnerToast.error("Unauthorized", {
      description: "Please log in to continue.",
    });
  },
};
