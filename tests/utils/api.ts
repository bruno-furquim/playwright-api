import { APIRequestContext } from '@playwright/test';

export async function getAuthToken(request: APIRequestContext): Promise<string> {
  const response = await request.post('/auth', {
    data: {
      username: 'admin',
      password: 'password123',
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok()) {
    throw new Error(`Erro ao obter token: ${response.status()} - ${await response.text()}`);
  }
  const body = await response.json();
  if (!body.token) {
    throw new Error('Token não encontrado na resposta');
  }
  return body.token;
}
