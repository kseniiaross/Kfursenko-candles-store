import api from "../api/axiosInstance";

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type TokenPayload = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access: string;
  refresh: string;
};

export type ProfileResponse = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
};

export async function register(payload: RegisterPayload): Promise<ProfileResponse> {
  const resp = await api.post<ProfileResponse>("/accounts/register/", payload);
  return resp.data;
}

export async function login(payload: TokenPayload): Promise<TokenResponse> {
  const resp = await api.post<TokenResponse>("/accounts/token/", payload);
  return resp.data;
}

export async function getProfile(): Promise<ProfileResponse> {
  const resp = await api.get<ProfileResponse>("/accounts/profile/");
  return resp.data;
}