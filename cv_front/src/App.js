import './App.css';
import React from 'react';
import { Layout, Menu ,Button} from 'antd';
import { CodeSandboxOutlined,MenuUnfoldOutlined,MenuFoldOutlined,MonitorOutlined
,PictureOutlined,ProjectOutlined,EditOutlined} from '@ant-design/icons';
import Harris from './harris'
import Sift from './sift'
import Stitch from './stitch'
import StitchDoc from './stitch_doc'
import Basic from './basic'
import Yolo from './yolo'
const { Header, Content, Sider,Footer } = Layout;

export default class App extends React.Component {
  handleClick = e => {
    console.log(e.key);
    if(e.key==="1"){
      this.setState ({content:<Sift></Sift>})
    }
    else if(e.key==="2"){
      this.setState ({content: <Harris></Harris>})
    }
    else if(e.key==="3"){
      this.setState ({content:<Stitch parent={this}></Stitch>})
    }
    else if(e.key==="4"){
      this.setState ({content:<Basic></Basic>})
    }
    else if(e.key==="5"){
      this.setState ({content:<Yolo></Yolo>})
    }
  };
  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };
  state = {
    content : <Basic></Basic>,
    collapsed: false,
  }
  getChildrenMsg = (result, msg) => {
    // console.log(result, msg)
    if(msg==1){
      this.setState({
        content: <Stitch parent={this}></Stitch>
      })
    }
    else if(msg==2){
      this.setState({
        content: <StitchDoc parent={this}></StitchDoc>
      })
    }
  }
  render(){
    return (
      <Layout>
        <Header className="my_head">
          <CodeSandboxOutlined style={{ padding: '12px' }}/>
          计算机视觉工具箱
        </Header>
        <Layout className="my_body">
          <Sider className="my_body" collapsed={this.state.collapsed}>
            <Button type="primary" onClick={this.toggleCollapsed} style={{ marginBottom: 0}}>
              {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
            </Button>
            <Menu 
              onClick={this.handleClick}
              mode="inline"
              defaultSelectedKeys={['4']}
              theme="light"
              className="my_menu"
            >
              <Menu.Item key="4" icon={<EditOutlined />}>
                图像基本操作
              </Menu.Item>
              <Menu.Item key="1" icon={<MonitorOutlined />}>
                SIFT特征检测
              </Menu.Item>
              <Menu.Item key="2" icon={<ProjectOutlined />}>
                Harris角点检测
              </Menu.Item>
              <Menu.Item key="3" icon={<PictureOutlined />}>
                图片全景拼接
              </Menu.Item>
              <Menu.Item key="5" icon={<MonitorOutlined />}>
                yolo目标检测
              </Menu.Item>
            </Menu>
          </Sider>
          <Content className="my_content">
              {this.state.content}
          </Content>
        </Layout>
        <Footer className="my_foot">
          Contact: 17717084193@163.com
        </Footer>
      </Layout>
    );
  }
}


