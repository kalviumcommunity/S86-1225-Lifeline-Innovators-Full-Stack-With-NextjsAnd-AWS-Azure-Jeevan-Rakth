"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import {
  Modal,
  Spinner,
  LoadingOverlay,
  ProgressBar,
  InlineLoader,
  ButtonLoader,
  SkeletonLoader,
} from "@/components";

/**
 * Feedback Demo Page
 *
 * Demonstrates all user feedback patterns:
 * 1. Toast Notifications (Instant Feedback)
 * 2. Modals/Dialogs (Blocking Feedback)
 * 3. Loaders/Progress (Process Feedback)
 */
export default function FeedbackDemo() {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // Toast examples
  const handleSuccessToast = () => {
    toast.success("Operation completed successfully!", {
      description: "Your data has been saved.",
    });
  };

  const handleErrorToast = () => {
    toast.error("Failed to complete operation", {
      description: "Please try again later.",
    });
  };

  const handleWarningToast = () => {
    toast.warning("Warning: This action requires confirmation", {
      description: "Please review before proceeding.",
    });
  };

  const handleInfoToast = () => {
    toast.info("New feature available!", {
      description: "Check out our latest updates.",
    });
  };

  const handleLoadingToast = () => {
    const toastId = toast.loading("Processing your request...");

    setTimeout(() => {
      toast.dismiss(toastId);
      toast.success("Request processed successfully!");
    }, 3000);
  };

  const handlePromiseToast = () => {
    const mockAsyncOperation = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve("Success!");
        } else {
          reject(new Error("Failed!"));
        }
      }, 2000);
    });

    toast.promise(mockAsyncOperation, {
      loading: "Uploading data...",
      success: "Data uploaded successfully!",
      error: "Upload failed. Please try again.",
    });
  };

  const handleActionToast = () => {
    toast.info("Item moved to trash", {
      description: "You can undo this action.",
      action: {
        label: "Undo",
        onClick: () => toast.success("Action undone!"),
      },
    });
  };

  // Modal examples
  const handleDeleteConfirmation = async () => {
    const confirmed = await confirm({
      title: "Delete Item",
      message:
        "Are you sure you want to delete this item? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (confirmed) {
      toast.success("Item deleted successfully!");
    } else {
      toast.info("Delete action cancelled");
    }
  };

  const handleWarningModal = async () => {
    const confirmed = await confirm({
      title: "Warning",
      message:
        "This action will affect multiple records. Do you want to continue?",
      confirmText: "Continue",
      cancelText: "Cancel",
      variant: "warning",
    });

    if (confirmed) {
      toast.success("Action completed!");
    }
  };

  // Loader examples
  const handleLoadingOverlay = () => {
    setIsLoadingOverlay(true);
    setTimeout(() => {
      setIsLoadingOverlay(false);
      toast.success("Page loaded successfully!");
    }, 3000);
  };

  const handleButtonLoading = () => {
    setIsButtonLoading(true);
    setTimeout(() => {
      setIsButtonLoading(false);
      toast.success("Form submitted successfully!");
    }, 2000);
  };

  const handleFileUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          toast.success("File uploaded successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleSkeletonToggle = () => {
    setShowSkeleton(true);
    setTimeout(() => {
      setShowSkeleton(false);
    }, 3000);
  };

  // Complete user flow demo
  const handleCompleteFlow = async () => {
    // Step 1: Show confirmation modal
    const confirmed = await confirm({
      title: "Start Process",
      message: "This will demonstrate a complete feedback flow. Continue?",
      confirmText: "Start",
      variant: "default",
    });

    if (!confirmed) {
      toast.info("Process cancelled");
      return;
    }

    // Step 2: Show loading overlay
    setIsLoadingOverlay(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoadingOverlay(false);

    // Step 3: Show progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Step 4: Show success toast
          toast.success("Process completed successfully!", {
            description: "All steps were executed without errors.",
          });
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            User Feedback Demo
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Explore all feedback patterns: Toasts, Modals, and Loaders
          </p>
        </div>

        {/* Toast Notifications Section */}
        <section className="mb-12 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            1. Toast Notifications (Instant Feedback)
          </h2>
          <p className="mb-6 text-gray-600">
            Non-intrusive messages that appear temporarily to confirm actions or
            show status.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={handleSuccessToast}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Success Toast
            </button>
            <button
              onClick={handleErrorToast}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Error Toast
            </button>
            <button
              onClick={handleWarningToast}
              className="rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
            >
              Warning Toast
            </button>
            <button
              onClick={handleInfoToast}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Info Toast
            </button>
            <button
              onClick={handleLoadingToast}
              className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Loading Toast
            </button>
            <button
              onClick={handlePromiseToast}
              className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Promise Toast
            </button>
            <button
              onClick={handleActionToast}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Toast with Action
            </button>
          </div>
        </section>

        {/* Modals Section */}
        <section className="mb-12 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            2. Modals & Dialogs (Blocking Feedback)
          </h2>
          <p className="mb-6 text-gray-600">
            Focused dialogs that require user attention and action before
            continuing.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={handleDeleteConfirmation}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Delete Confirmation
            </button>
            <button
              onClick={handleWarningModal}
              className="rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
            >
              Warning Modal
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Custom Modal
            </button>
          </div>
        </section>

        {/* Loaders Section */}
        <section className="mb-12 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            3. Loaders & Progress (Process Feedback)
          </h2>
          <p className="mb-6 text-gray-600">
            Visual indicators that show progress and keep users informed during
            operations.
          </p>

          <div className="space-y-6">
            {/* Spinner Examples */}
            <div>
              <h3 className="mb-3 font-semibold text-gray-700">Spinners</h3>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-sm text-gray-600">Small</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <span className="text-sm text-gray-600">Medium</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <span className="text-sm text-gray-600">Large</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="xl" />
                  <span className="text-sm text-gray-600">Extra Large</span>
                </div>
              </div>
            </div>

            {/* Inline Loader */}
            <div>
              <h3 className="mb-3 font-semibold text-gray-700">
                Inline Loader
              </h3>
              <InlineLoader text="Processing data..." />
            </div>

            {/* Button Loader */}
            <div>
              <h3 className="mb-3 font-semibold text-gray-700">
                Button with Loading State
              </h3>
              <ButtonLoader
                isLoading={isButtonLoading}
                onClick={handleButtonLoading}
                variant="primary"
                loadingText="Submitting..."
              >
                Submit Form
              </ButtonLoader>
            </div>

            {/* Progress Bar */}
            <div>
              <h3 className="mb-3 font-semibold text-gray-700">Progress Bar</h3>
              <div className="space-y-4">
                <ProgressBar progress={uploadProgress} label="File Upload" />
                <button
                  onClick={handleFileUpload}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Start Upload
                </button>
              </div>
            </div>

            {/* Skeleton Loader */}
            <div>
              <h3 className="mb-3 font-semibold text-gray-700">
                Skeleton Loader
              </h3>
              {showSkeleton ? (
                <SkeletonLoader lines={5} />
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    This is actual content that loads after skeleton.
                  </p>
                  <p className="text-gray-700">
                    Skeleton loaders provide better perceived performance.
                  </p>
                  <p className="text-gray-700">
                    Users see structure while content is loading.
                  </p>
                </div>
              )}
              <button
                onClick={handleSkeletonToggle}
                className="mt-4 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Toggle Skeleton
              </button>
            </div>

            {/* Loading Overlay */}
            <div>
              <h3 className="mb-3 font-semibold text-gray-700">
                Loading Overlay
              </h3>
              <button
                onClick={handleLoadingOverlay}
                className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Show Loading Overlay
              </button>
            </div>
          </div>
        </section>

        {/* Complete Flow Demo */}
        <section className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-md">
          <h2 className="mb-4 text-2xl font-semibold">
            Complete User Feedback Flow
          </h2>
          <p className="mb-6">
            Watch all feedback patterns work together: Modal → Loading →
            Progress → Toast
          </p>
          <button
            onClick={handleCompleteFlow}
            className="rounded-md bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-gray-100"
          >
            Start Complete Flow Demo
          </button>
        </section>

        {/* UX Principles */}
        <section className="mt-12 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            UX Principles Applied
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Non-intrusive:</strong> Toasts don&apos;t block user
                actions
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Informative:</strong> Clear messages explain what&apos;s
                happening
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Accessible:</strong> Screen reader support with ARIA
                labels
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Consistent:</strong> Color coding (green=success,
                red=error, etc.)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Smooth animations:</strong> Natural transitions, not
                flashy
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Focus management:</strong> Modals trap focus
                appropriately
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Progress visibility:</strong> Users always know
                what&apos;s happening
              </span>
            </li>
          </ul>
        </section>
      </div>

      {/* Modal Components */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Custom Modal Example"
        onConfirm={() => {
          toast.success("Modal action confirmed!");
          setIsModalOpen(false);
        }}
      >
        <p className="text-gray-600">
          This is a custom modal with full keyboard navigation support. Try
          pressing TAB to navigate between buttons, or ESC to close.
        </p>
      </Modal>

      <ConfirmDialog />
      <LoadingOverlay
        isVisible={isLoadingOverlay}
        message="Processing your request..."
      />
    </div>
  );
}
