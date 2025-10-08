import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Session, ValidateSessionCodeResponse, ValidateSessionIdResponse } from '@/model/Session';
import { SessionFlow } from '@/state/application-state';

const api = axios.create({
  baseURL: 'http://192.168.1.156:5172',
});

export async function validateSessionCode(
  sessionCode: string
): Promise<ValidateSessionCodeResponse> {
  const { data } = await api.get(`/api/v1/sessions/get-session-by-session-code/${sessionCode}`);
  return data;
}

export function useValidateSessionCode() {
  return useMutation({
    mutationFn: async (sessionCode: string) => validateSessionCode(sessionCode),
  });
}

export async function validateSessionId(sessionId: string): Promise<ValidateSessionIdResponse> {
  const { data } = await api.get(`/api/v1/sessions/get-session-by-id/${sessionId}`);
  return data;
}

export function useValidateSessionId() {
  return useMutation({
    mutationFn: async (sessionId: string) => validateSessionId(sessionId),
  });
}

export async function saveSession(sessionFlow: SessionFlow): Promise<ValidateSessionIdResponse> {
  const { data } = await api.post(`/api/v1/sessions/create-or-attach-session`, sessionFlow);
  return data;
}

export function useSaveSession() {
  return useMutation({
    mutationFn: async (sessionFlow: SessionFlow) => saveSession(sessionFlow),
  });
}
