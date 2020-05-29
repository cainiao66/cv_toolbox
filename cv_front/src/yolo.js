import React,{ useState }  from 'react';
import './config.js'
import PicturesWall from './pics'
import {Form,Button, Typography, Divider,Row, Col,Card,Empty,message,InputNumber,Switch,Spin,PageHeader} from 'antd';
import axios from "axios";
import { DownloadOutlined } from '@ant-design/icons';

const {  Paragraph} = Typography;
var baseUrl = global.url.baseUrl;

export default class Yolo extends React.Component{
    constructor(props) {
      super(props);
      this.state = {
        pics:[],
        out_pic:null,
        output:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
      }
    }
    formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 12 },
    };

    downloadPic = () =>{
      let a = document.createElement("a"); 
      let event = new MouseEvent("click"); 
      a.download =  "image.jpg"; 
      a.href = this.state.out_pic; 
      a.dispatchEvent(event); 
    }

    getPic = (val) =>{
      this.setState({
        pics:val
      })
      console.log(this.state.pics)
    }
  
    onFinish = values => {
      console.log('Received values of form: ', values);
      if(this.state.pics.length==0){
        /*错误提示*/ 
        message.info("请输入至少一张图片");
      }
      else{
        this.setState({
          output:<Spin tip="Loading..."/>,
        })
        axios({
          method: 'post',
          url: baseUrl+'/cv_yolo',
          data: {
            'image':this.state.pics[0],
            'threshold':values.threshold,
          },
        })
        .then((res) => {
          this.setState({
            out_pic:"data:image/jpg;base64,"+res.data
          })
          this.setState({
            output: <Card hoverable cover={<img src={this.state.out_pic} />}><Button onClick={this.downloadPic} block type="primary" icon={<DownloadOutlined />} >Download</Button> </Card> 
          })
          console.log(res)
        })
        .catch((error) => {
          message.error("网络错误或服务器故障，请重试或联系开发者！");
          this.setState({
            output:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
          })
        })
      }
    };

    render(){
      return (
          <Typography>
            <PageHeader
              title="yolo目标检测"
              style={{paddingLeft:'0px',paddingBottom:'0px'}}
            ></PageHeader>
            <Divider />
            <Paragraph>
              相关介绍
            </Paragraph>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              <Col span={11}>
                <Card title="输入" bordered={true} style={{height:'100%'}}>
                  <Form {...this.formItemLayout} onFinish={this.onFinish}>
                    <Form.Item name="threshold" label="threshold" help="0.10-0.90 值越小，检测到的目标越多,但精确度会降低" initialValue="0.30">
                      <InputNumber min={0.10} max={0.90} step={0.05}></InputNumber>
                    </Form.Item>
                    <Form.Item label="上传图片">
                      <PicturesWall max_pic={1} getChildValue={this.getPic.bind(this)}></PicturesWall>
                    </Form.Item>
                    <Form.Item wrapperCol={{ span: 18, offset: 8}}>
                      <Button type="primary" htmlType="submit">
                        Submit
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
              <Col span={11}>
              <Card title="输出" bordered={true} style={{height:'100%',textAlign:"center",verticalAlign:"center"}} >
                  {this.state.output}
                </Card>
              </Col>
            </Row>
          </Typography>
        )
    }
  }