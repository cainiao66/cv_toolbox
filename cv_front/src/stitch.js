import React from 'react';
import PicturesWall from './pics'
import {Form,Button, Typography, Divider,Row, Col,Card,Empty,message,Spin,Switch,Radio} from 'antd';
import axios from "axios";
import { DownloadOutlined } from '@ant-design/icons';
const { Title, Paragraph, Text } = Typography;
//var baseUrl = "http://localhost:5000";
var baseUrl = "";


export default class Sift extends React.Component{
  formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 12 },
  };

  state = {
    pics:[],
    out_pic:null,
    output:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
  }

  getPic = (val) =>{
    this.setState({
      pics:val
    })
    console.log(this.state.pics)
  }

  downloadPic = () =>{
    let a = document.createElement("a"); 
    let event = new MouseEvent("click"); 
    a.download =  "image.jpg"; 
    a.href = this.state.out_pic; 
    a.dispatchEvent(event); 
  }


  onFinish = values => {
    if(this.state.pics.length<2){
      /*错误提示*/ 
      message.info("请输入至少两张图片");
    }
    else{
      this.setState({
        output:<Spin tip="Loading..."/>,
      })
      console.log('Received values of form: ', values);
      axios({
        method: 'post',
        url: baseUrl+'/cv_stitch',
        data: {
          'image':this.state.pics,
          'color_adjust':values.color_adjust,
          'direction':values.direction
        },
      })
      .then((res) => {
        if(res.data=="fail"){
          message.error("您输入的两张图片匹配点数目不够，无法完成拼接！");
          this.setState({
            output:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
          })
        }
        else{
          this.setState({
            out_pic:"data:image/jpg;base64,"+res.data
          })
          this.setState({
            output: <Card hoverable cover={<img src={this.state.out_pic} />}><Button onClick={this.downloadPic} block type="primary" icon={<DownloadOutlined />} >Download</Button> </Card> 
          })
        }
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
          <Title level={4}>全景拼接</Title>
          <Divider />
          <Paragraph>
            输入两张有重合部分的图片，进行图片自动拼接
          </Paragraph>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={11}>
              <Card title="输入" bordered={true} style={{height:'100%'}}>
                <Form {...this.formItemLayout} onFinish={this.onFinish}>
                  <Form.Item name="direction" label="拼接方式" initialValue={1}>
                    <Radio.Group name="radiogroup">
                      <Radio value={1}>横向拼接</Radio>
                      <Radio value={2}>纵向拼接</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item name="color_adjust" label="色差调节" help="开启可自动调节图片色彩差异，提高拼接效果，建议开启" initialValue={true}>
                    <Switch defaultChecked/>
                  </Form.Item>
                  <Form.Item label="上传图片">
                    <PicturesWall max_pic={2}  getChildValue={this.getPic.bind(this)}></PicturesWall>
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