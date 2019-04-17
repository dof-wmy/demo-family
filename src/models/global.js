import { queryNotices, apiConfig } from '@/services/api';

import Pusher from 'pusher-js';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    pusher: null,
    pusherChannelPublic: null,
    pusherChannelCurrent: null,
    config: {
      socialite: [],
    },
  },

  effects: {
    *fetchNotices(_, { call, put, select }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      const unreadCount = yield select(
        state => state.global.notices.filter(item => !item.read).length
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: data.length,
          unreadCount,
        },
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      const unreadCount = yield select(
        state => state.global.notices.filter(item => !item.read).length
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: count,
          unreadCount,
        },
      });
    },
    *changeNoticeReadState({ payload }, { put, select }) {
      const notices = yield select(state =>
        state.global.notices.map(item => {
          const notice = { ...item };
          if (notice.id === payload) {
            notice.read = true;
          }
          return notice;
        })
      );
      yield put({
        type: 'saveNotices',
        payload: notices,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: notices.length,
          unreadCount: notices.filter(item => !item.read).length,
        },
      });
    },
    *pusherInit({ payload }, { put }) {
      console.log('pusher Init', payload);
      Pusher.logToConsole = PUSHER_LOG_TO_CONSOLE;
      if (PUSHER_APP_KEY && PUSHER_APP_CLUSTER) {
        const pusher = new Pusher(PUSHER_APP_KEY, {
          cluster: PUSHER_APP_CLUSTER,
          forceTLS: true,
          // TODO pusher 权限验证
          // authEndpoint: '/pusher_auth.php',
          // auth: {
          //   headers: {
          //     'X-CSRF-Token': "SOME_CSRF_TOKEN"
          //   }
          // }
        });
        yield put({
          type: 'savePusher',
          payload: pusher,
        });
        if (PUSHER_CHANNEL) {
          yield put({
            type: 'savePusherChannelPublic',
            payload: pusher.subscribe(PUSHER_CHANNEL),
          });
        }
      }
    },
    *pusherChannelCurrentSubscribe({ payload }, { put }) {
      yield put({
        type: 'savePusherChannelCurrent',
        payload: payload.channelName,
      });
    },
    *getConfig({ payload }, { call, put }) {
      console.log('global getConfig', payload);
      const data = yield call(apiConfig);
      yield put({
        type: 'saveConfig',
        payload: data,
      });
      //   console.log('getConfig');
      //   // yield put({
      //   //   type: 'savePusherChannelCurrent',
      //   //   payload: payload.channelName,
      //   // });
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
    saveConfig(state, { payload }) {
      return {
        ...state,
        config: payload,
      };
    },
    savePusher(state, { payload }) {
      return {
        ...state,
        pusher: payload,
      };
    },
    savePusherChannelPublic(state, { payload }) {
      return {
        ...state,
        pusherChannelPublic: payload,
      };
    },
    savePusherChannelCurrent(state, { payload }) {
      return {
        ...state,
        pusherChannelCurrent: state.pusher ? state.pusher.subscribe(payload) : null,
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
