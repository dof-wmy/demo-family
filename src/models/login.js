import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { apiLogin, getFakeCaptcha } from '@/services/api';
import { setAuthority, setAccessToken } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    // *login({ payload }, { call, put, take }) {
    *login({ payload }, { call, put }) {
      const response = yield call(apiLogin, payload);
      const type = 'account';
      yield put({
        type: 'changeLoginStatus',
        payload: response
          ? {
              status: 'ok',
              type,
              currentAuthority: 'admin',
              accessToken: response.access_token,
            }
          : {
              status: 'error',
              type,
              currentAuthority: 'guest',
            },
      });
      // Login successfully
      if (response) {
        // yield put({
        //   type: 'user/fetchCurrent',
        // });
        // yield take('user/fetchCurrent/@@end');
        reloadAuthorized();
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            redirect = null;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    *logout(_, { put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: 'guest',
        },
      });
      yield put({
        type: 'user/saveCurrentUser',
        payload: {},
      });
      reloadAuthorized();
      // redirect
      if (window.location.pathname !== '/user/login') {
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          })
        );
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAccessToken(payload.accessToken);
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
