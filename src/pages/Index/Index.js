import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Avatar } from 'antd';

@connect(({ user }) => ({
  currentUser: user.currentUser,
}))
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    const { currentUser } = this.props;
    return (
      <Card title="基本信息">
        <Row>
          <Col span="2">
            <Avatar
              size="large"
              // icon="user"
              src={currentUser.avatar}
              alt={currentUser.username}
            >
              {currentUser.name}
            </Avatar>
          </Col>
          <Col span="2">{currentUser.name}</Col>
          <Col span="2">{currentUser.username}</Col>
        </Row>
      </Card>
    );
  }
}

export default Index;
