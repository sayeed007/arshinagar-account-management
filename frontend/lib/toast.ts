import toast from 'react-hot-toast';

/**
 * Toast utility functions for consistent notifications throughout the app
 *
 * These functions wrap react-hot-toast with sensible defaults and
 * consistent styling that matches our application design.
 */

export const showSuccess = (message: string) => {
  return toast.success(message, {
    duration: 4000,
  });
};

export const showError = (message: string) => {
  return toast.error(message, {
    duration: 5000,
  });
};

export const showInfo = (message: string) => {
  return toast(message, {
    duration: 4000,
    icon: 'ℹ️',
  });
};

export const showWarning = (message: string) => {
  return toast(message, {
    duration: 4500,
    icon: '⚠️',
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages);
};

// Re-export toast for advanced usage
export { toast };
