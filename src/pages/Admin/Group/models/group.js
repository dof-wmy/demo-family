import { adminGroups, adminGroupPermission } from '@/services/api';

export default {
  namespace: 'adminGroup',

  state: {
    groups: [],
    permissionOptions: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(adminGroups, payload);
      yield put({
        type: 'save',
        payload: {
          groups: response.data || [],
          permissionOptions: response.meta.permissionOptions || [],
        },
      });
    },
    *permission({ payload, callback }, { call }) {
      const response = yield call(adminGroupPermission, {
        group_id: payload.group.id,
        permission_id: payload.permission.value,
        checked: payload.checked,
      });
      if (callback) callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
