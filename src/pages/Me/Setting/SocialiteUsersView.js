import React, { Component } from 'react';
import { Avatar, List, Button, Popconfirm } from 'antd';
import { connect } from 'dva';
import styles from './BaseView.less';

@connect(({ user, loading, global }) => ({
  currentUser: user.currentUser,
  pusherChannelCurrent: global.pusherChannelCurrent,
  loading: loading.models.user,
}))
class SocialiteUsersView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bindLoading: false,
      pusherChannelCurrentBinded: false,
    };
  }

  componentDidMount() {
    //
  }

  socialiteDetachHandle = socialiteUser => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/updateMe',
      payload: {
        socialiteUsers: {
          detach: socialiteUser.id,
        },
      },
      callback: response => {
        if (response && !response.error_message) {
          if (response.socialiteUsers) {
            dispatch({
              type: 'user/saveCurrentUser',
              payload: response,
            });
          }
        }
      },
    });
  };

  listenCurrentUser = () => {
    const { pusherChannelCurrent, dispatch } = this.props;
    const { pusherChannelCurrentBinded } = this.state;
    this.setState({
      bindLoading: true,
    });

    if (pusherChannelCurrent && pusherChannelCurrentBinded === false) {
      pusherChannelCurrent.bind('App\\Events\\SocialiteLoginSuccess', data => {
        console.log(
          'pusherChannelCurrent App\\Events\\SocialiteLoginSuccess',
          // pusherChannelCurrent,
          data
        );
        this.setState({
          bindLoading: false,
        });
        dispatch({
          type: 'user/fetchCurrent',
          payload: {},
        });
      });
      this.setState({
        pusherChannelCurrentBinded: true,
      });
    }
  };

  render() {
    const { currentUser, loading } = this.props;
    const { bindLoading } = this.state;
    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.left}>
          {currentUser.socialiteUsers.map(socialiteUserItem => {
            return (
              <List
                key={socialiteUserItem.driver}
                itemLayout="horizontal"
                bordered
                loading={loading || bindLoading}
                locale={{
                  emptyText: '尚未绑定',
                }}
                size="small"
                header={
                  <div>
                    <a
                      href={socialiteUserItem.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      style={{ color: '#000' }}
                    >
                      <Avatar src={socialiteUserItem.logo} />
                      {socialiteUserItem.name}
                    </a>
                    <a
                      href={socialiteUserItem.oauthUrl}
                      onClick={this.listenCurrentUser}
                      rel="noopener noreferrer"
                      target="_blank"
                      style={{ float: 'right' }}
                    >
                      绑定
                    </a>
                  </div>
                }
                footer={socialiteUserItem.description}
                dataSource={socialiteUserItem.socialiteUsers}
                renderItem={socialiteUser => (
                  <List.Item>
                    <List.Item.Meta
                      key={socialiteUser.id}
                      avatar={<Avatar icon={socialiteUserItem.icon} src={socialiteUser.avatar} />}
                      title={
                        <div>
                          <a
                            href={socialiteUser.url || socialiteUserItem.url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {socialiteUser.name} [ {socialiteUser.nickname} ]
                          </a>
                          <Popconfirm
                            title="确定要解绑吗？"
                            onConfirm={() => this.socialiteDetachHandle(socialiteUser)}
                            okText="解绑"
                            cancelText="再想想"
                          >
                            <Button
                              title="解绑"
                              shape="circle"
                              icon="close"
                              type="danger"
                              // size="small"
                              style={{ width: '20px', height: '20px', fontSize: '10px' }}
                            />
                          </Popconfirm>
                        </div>
                      }
                      description={
                        <a href={`mailto:${socialiteUser.email}`}>{socialiteUser.email}</a>
                      }
                    />
                  </List.Item>
                )}
              />
            );
          })}
        </div>
        <div className={styles.right}>{/*  */}</div>
      </div>
    );
  }
}

export default SocialiteUsersView;
