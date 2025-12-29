"use client";

import { useState } from "react";
import Modal from "../components/ui/Modal";

/**
 * Confirmation Dialog Hook
 *
 * Provides a reusable confirmation modal for destructive actions
 * Returns both the modal component and a function to show it
 *
 * Usage:
 * const { ConfirmDialog, confirm } = useConfirmDialog();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure? This cannot be undone.',
 *     variant: 'danger'
 *   });
 *
 *   if (confirmed) {
 *     // Perform delete
 *   }
 * };
 */

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning" | "success";
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
  };

  const ConfirmDialog = () => (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={options.title}
      onConfirm={handleConfirm}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
    >
      <p className="text-gray-600">{options.message}</p>
    </Modal>
  );

  return {
    confirm,
    ConfirmDialog,
  };
}
