import { useState } from "react";

/**
 * Manages password update flow: fields, validation, submit via provided updater.
 * @param {object} options
 * @param {function} options.onUpdate - Async function receiving { id, password }.
 * @param {number|string} options.userId - Current user id.
 */
export default function useUpdatePassword({ onUpdate, userId }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const validate = () => {
    const next = {};
    if (!newPassword || newPassword.length < 6) {
      next.newPassword = "Şifre en az 6 karakter olmalı";
    }
    if (newPassword !== confirmPassword) {
      next.confirmPassword = "Şifreler eşleşmiyor";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setResult(null);
    if (!validate()) return { success: false, error: "validation" };
    setIsSubmitting(true);
    try {
      const res = await onUpdate({ id: userId, password: newPassword });
      setResult(res?.success ? { type: "success" } : { type: "error", message: res?.error?.message || res?.error || "Güncelleme hatası" });
      if (res?.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
      return res;
    } catch (err) {
      setResult({ type: "error", message: err.message });
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    fields: {
      currentPassword,
      newPassword,
      confirmPassword,
    },
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    errors,
    isSubmitting,
    result,
    submit,
  };
}

