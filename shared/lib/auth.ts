import { api } from "./api";
import type { AuthUser, VehicleType } from "../types";

type MessageResponse = { success: true; message: string };
type UserResponse = { success: true; user: AuthUser };
type LoginResponse = MessageResponse & UserResponse;

export type RegisterInput = { name: string; email: string; phone: string; password: string };
export type LoginInput = { email: string; password: string };
export type VerifyEmailInput = { email: string; otp: string };
export type ResetPasswordInput = { email: string; otp: string; newPassword: string };
// CNIC is mein jaan boojh kar nahi: rider signup use server ko bhejta hi nahi
export type RiderRegisterInput = RegisterInput & { vehicleType: VehicleType; registration: string };
export type RiderLoginInput = { identifier: string; password: string; remember: boolean };

export const register = (body: RegisterInput) =>
  api<MessageResponse>("/auth/register", { method: "POST", body });

// user: code sahi aur account isi app ka -> backend ne login bhi kar diya (cookie lag gayi)
export const verifyEmail = (body: VerifyEmailInput) =>
  api<MessageResponse & { user?: AuthUser }>("/auth/verify-email", { method: "POST", body });

export const resendOtp = (email: string) =>
  api<MessageResponse>("/auth/resend-otp", { method: "POST", body: { email } });

export const login = (body: LoginInput) => api<LoginResponse>("/auth/login", { method: "POST", body });

export const registerRider = (body: RiderRegisterInput) =>
  api<MessageResponse>("/auth/rider/register", { method: "POST", body });

export const riderLogin = (body: RiderLoginInput) => api<LoginResponse>("/auth/rider/login", { method: "POST", body });

export const logout = () => api<MessageResponse>("/auth/logout", { method: "POST" });

export const getMe = () => api<UserResponse>("/auth/me");

export const forgotPassword = (email: string) =>
  api<MessageResponse>("/auth/forgot-password", { method: "POST", body: { email } });

export const resetPassword = (body: ResetPasswordInput) =>
  api<MessageResponse>("/auth/reset-password", { method: "POST", body });
