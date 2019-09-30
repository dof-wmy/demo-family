import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import Link from 'umi/link';
import { Checkbox, Alert, message, Icon } from 'antd';
import Login from '@/components/Login';

import defaultSettings from '../../defaultSettings';

import styles from './Login.less';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading, global }) => ({
  login,
  submitting: loading.effects['login/login'],
  socialite: global.config.socialite,
  pusher: global.pusher,
}))
class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
    pusherSocialiteLoginChannel: null,
    loading: false,
  };

  componentDidMount() {
    const { pusher, dispatch } = this.props;
    if (pusher === null) {
      dispatch({
        type: 'global/pusherInit',
        payload: {},
      });
    }
  }

  onTabChange = type => {
    this.setState({ type });
  };

  onGetCaptcha = () =>
    new Promise((resolve, reject) => {
      this.loginForm.validateFields(['mobile'], {}, (err, values) => {
        if (err) {
          reject(err);
        } else {
          const { dispatch } = this.props;
          dispatch({
            type: 'login/getCaptcha',
            payload: values.mobile,
          })
            .then(resolve)
            .catch(reject);
          message.warning(formatMessage({ id: 'app.login.verification-code-warning' }));
        }
      });
    });

  handleSubmit = (err, values) => {
    const { type } = this.state;
    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: {
          ...values,
          type,
        },
      });
    }
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  listenSocialiteLogin = socialiteItem => {
    const { pusher, dispatch } = this.props;
    let { pusherSocialiteLoginChannel } = this.state;
    console.log('listenSocialiteLogin', socialiteItem, pusher);
    if (pusher !== null) {
      pusherSocialiteLoginChannel = pusher.subscribe(socialiteItem.pusherChannelName);
      this.setState({
        pusherSocialiteLoginChannel,
        loading: true,
      });
      pusherSocialiteLoginChannel.bind('App\\Events\\SocialiteLoginSuccess', data => {
        console.log(
          'pusherChannelCurrent App\\Events\\SocialiteLoginSuccess',
          // pusherChannelCurrent,
          data
        );
        const { code, users } = data;
        const [user] = users;
        const usersCount = users.length;
        if (usersCount === 0) {
          message.error('该账户尚未绑定到管理员账户');
        } else {
          // TODO 让用户选择登录哪个账户
          // users
        }
        if (code && user) {
          dispatch({
            type: 'login/login',
            payload: {
              code,
              user,
              type: 'socialite',
            },
          });
        }

        this.setState({
          loading: false,
        });
      });
    }
  };

  render() {
    const { login, submitting, socialite } = this.props;
    const { type, autoLogin, loading } = this.state;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab={formatMessage({ id: 'app.login.tab-login-credentials' })}>
            {login.status === 'error' &&
              login.type === 'account' &&
              !submitting &&
              !loading &&
              this.renderMessage(formatMessage({ id: 'app.login.message-invalid-credentials' }))}
            <UserName
              name="username"
              placeholder={`${formatMessage({ id: 'app.login.userName' })}`}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'validation.userName.required' }),
                },
              ]}
            />
            <Password
              name="password"
              placeholder={`${formatMessage({ id: 'app.login.password' })}`}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'validation.password.required' }),
                },
              ]}
              onPressEnter={e => {
                e.preventDefault();
                this.loginForm.validateFields(this.handleSubmit);
              }}
            />
          </Tab>
          {defaultSettings.mobileLogin.enable && (
            <Tab key="mobile" tab={formatMessage({ id: 'app.login.tab-login-mobile' })}>
              {login.status === 'error' &&
                login.type === 'mobile' &&
                !submitting &&
                this.renderMessage(
                  formatMessage({ id: 'app.login.message-invalid-verification-code' })
                )}
              <Mobile
                name="mobile"
                placeholder={formatMessage({ id: 'form.phone-number.placeholder' })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({ id: 'validation.phone-number.required' }),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: formatMessage({ id: 'validation.phone-number.wrong-format' }),
                  },
                ]}
              />
              <Captcha
                name="captcha"
                placeholder={formatMessage({ id: 'form.verification-code.placeholder' })}
                countDown={120}
                onGetCaptcha={this.onGetCaptcha}
                getCaptchaButtonText={formatMessage({ id: 'form.get-captcha' })}
                getCaptchaSecondText={formatMessage({ id: 'form.captcha.second' })}
                rules={[
                  {
                    required: true,
                    message: formatMessage({ id: 'validation.verification-code.required' }),
                  },
                ]}
              />
            </Tab>
          )}
          <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              <FormattedMessage id="app.login.remember-me" />
            </Checkbox>
            {defaultSettings.resetPassword.enable && (
              <a style={{ float: 'right' }} href="">
                <FormattedMessage id="app.login.forgot-password" />
              </a>
            )}
          </div>
          <Submit loading={submitting || loading}>
            <FormattedMessage id="app.login.login" />
          </Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
