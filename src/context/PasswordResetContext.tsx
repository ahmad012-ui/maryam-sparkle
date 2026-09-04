import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  passwordResetService,
  RequestResetResponse,
  VerifyOtpResponse,
  ResetPasswordResponse
} from '../services/passwordResetService';

interface PasswordResetContextValue {
  email: string;
  resetToken: string | null;
  setEmail: (email: string) => void;
  setResetToken: (token: string | null) => void;
  requestReset: (targetEmail: string) => Promise<RequestResetResponse>;
  resendOtp: () => Promise<RequestResetResponse>;
  verifyOtp: (otp: string) => Promise<VerifyOtpResponse>;
  submitNewPassword: (newPassword: string) => Promise<ResetPasswordResponse>;
  clearResetFlow: () => void;
}

const PasswordResetContext = createContext<PasswordResetContextValue | undefined>(undefined);

export const PasswordResetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmailState] = useState<string>(() => passwordResetService.getPendingEmail() || '');
  const [resetToken, setResetTokenState] = useState<string | null>(null);

  const setEmail = (newEmail: string) => {
    const clean = newEmail.trim().toLowerCase();
    setEmailState(clean);
    passwordResetService.setPendingEmail(clean);
  };

  const setResetToken = (token: string | null) => {
    setResetTokenState(token);
  };

  const clearResetFlow = () => {
    setEmailState('');
    setResetTokenState(null);
    passwordResetService.clearResetSession();
  };

  const requestReset = async (targetEmail: string): Promise<RequestResetResponse> => {
    const res = await passwordResetService.requestPasswordReset(targetEmail);
    if (res.success) {
      setEmail(targetEmail);
    }
    return res;
  };

  const resendOtp = async (): Promise<RequestResetResponse> => {
    if (!email) {
      return {
        success: false,
        message: 'No email found to resend verification code to. Please re-enter your email.',
        email: ''
      };
    }
    return await passwordResetService.resendResetOtp(email);
  };

  const verifyOtp = async (otp: string): Promise<VerifyOtpResponse> => {
    const res = await passwordResetService.verifyResetOtp(email, otp);
    if (res.success && res.resetToken) {
      setResetTokenState(res.resetToken);
    }
    return res;
  };

  const submitNewPassword = async (newPassword: string): Promise<ResetPasswordResponse> => {
    if (!resetToken) {
      return {
        success: false,
        message: 'Missing verification token. Please verify your OTP code first.'
      };
    }
    const res = await passwordResetService.resetPassword(resetToken, newPassword);
    if (res.success) {
      setResetTokenState(null);
    }
    return res;
  };

  return (
    <PasswordResetContext.Provider
      value={{
        email,
        resetToken,
        setEmail,
        setResetToken,
        requestReset,
        resendOtp,
        verifyOtp,
        submitNewPassword,
        clearResetFlow
      }}
    >
      {children}
    </PasswordResetContext.Provider>
  );
};

export const usePasswordReset = (): PasswordResetContextValue => {
  const context = useContext(PasswordResetContext);
  if (!context) {
    throw new Error('usePasswordReset must be used within a PasswordResetProvider');
  }
  return context;
};
