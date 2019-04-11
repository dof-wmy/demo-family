/**
 * request 网络请求工具
 * 更详细的api文档: https://bigfish.alipay.com/doc/api#request
 */
import { extend } from 'umi-request';
import { notification, message } from 'antd';
// import router from 'umi/router';
// import fetch from 'dva/fetch';
// import hash from 'hash.js';
// import { isAntdPro } from './utils';
import { getAccessToken } from '@/utils/authority';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = error => {
  const { response = {} } = error;
  const errortext = codeMessage[response.status] || response.statusText;
  const { status, url } = response;

  if (status === 401) {
    if (window.location.pathname !== '/user/login') {
      notification.error({
        message: '未登录或登录已过期，请重新登录。',
      });
      // @HACK
      /* eslint-disable no-underscore-dangle */
      window.g_app._store.dispatch({
        type: 'login/logout',
      });
    }
    return null;
  }

  // environment should not be used
  if (status === 403) {
    notification.error({
      message: '无权限',
      description: '请联系管理员授权',
    });
    // router.push('/exception/403');
    return null;
  }
  if (status === 422) {
    response.json().then(data => {
      message.error(data.errors[Object.keys(data.errors)[0]][0]);
    });
    return null;
  }

  console.log(error, {
    message: `请求错误 ${status}: ${url}`,
    description: errortext,
    response,
  });

  notification.error({
    message: '网络错误',
    description: '请稍后再试',
  });

  // if (status >= 404 && status < 422) {
  //   router.push('/exception/404');
  // }
  // if (status <= 504 && status >= 500) {
  //   router.push('/exception/500');
  //   return null;
  // }

  return null;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});
// request interceptor, change url or options.
request.interceptors.request.use((url, options) => {
  const accessToken = getAccessToken();
  const newOptions = options;
  newOptions.headers = {
    ...newOptions.headers,
    Authorization: `Bearer ${accessToken}`,
  };
  return {
    url: `${url}`,
    options: {
      ...newOptions,
      interceptors: true,
    },
  };
});

// response interceptor, handling response
request.interceptors.response.use((response, options) => {
  response
    .clone()
    .json()
    .then(data => {
      if (data.error_message) {
        message.error(data.error_message);
      }
      if (data.success_message) {
        message.success(data.success_message);
      }
    });
  // response.headers.append('interceptors', 'yes yo');
  console.log('response interceptors', {
    response,
    options,
  });
  return response;
});

export default request;
