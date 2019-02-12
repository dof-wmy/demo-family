import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/currentUser');
}

export async function me() {
  return request(`${API_ROOT}/auth/me`);
}

export async function updateMe(params) {
  return request(`${API_ROOT}/auth/me`, {
    method: 'POST',
    body: params,
  });
}
