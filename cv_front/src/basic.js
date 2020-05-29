import React from 'react';
import PicturesWall from './pics'
import {Form,Button, Typography, Divider,Row, Col,Card,Empty,message,Spin,PageHeader,Slider,Radio} from 'antd';
import axios from "axios";
import { DownloadOutlined } from '@ant-design/icons';
import './config.js'
const {  Paragraph} = Typography;
var baseUrl = global.url.baseUrl

export default class Sift extends React.Component{
    formItemLayout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 12 },
      };

      brightness_text = <Form.Item name="pic_brightness" label="图像亮度" initialValue={10} help="亮度值为10则不变，小于10变暗，大于10变亮">
                            <Slider min={1} max={20}/>
                        </Form.Item>;
  
      state = {
        pics:[],
        out_pic:null,
        output:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        brightness:<div></div>,
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

      onChangeBrightness = e =>{
        console.log(e.target.value)
        if(e.target.value === 3){
          this.setState({
            brightness:this.brightness_text,
          });
        }
        else{
          this.setState({
            brightness:<div></div>,
          });
        }
      }
    
      onFinish = values => {
        if(this.state.pics.length==0){
          /*错误提示*/ 
          message.info("请输入至少一张图片");
        }
        else{
          this.setState({
            output:<Spin tip="Loading..."/>,
          })
          console.log('Received values of form: ', values);
          axios({
            method: 'post',
            url: baseUrl+'/cv_basic',
            data: {
                'image':this.state.pics[0],
                'pic_brightness_mode':values.pic_brightness_mode,
                'pic_brightness':values.pic_brightness,
                'pic_style':values.pic_style
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
                title="图像基本操作"
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
                        <Form.Item name="pic_brightness_mode" label="亮度调节" initialValue={1} help="亮度值为10则不变，小于10变暗，大于10变亮">
                            <Radio.Group name="radiogroup" onChange={this.onChangeBrightness}>
                                <Radio value={1}>不变</Radio>
                                <Radio value={2}>自动调节</Radio>
                                <Radio value={3}>手动调节</Radio>
                            </Radio.Group>
                        </Form.Item>
                        {this.state.brightness}
                        <Form.Item name="pic_style" label="风格迁移" initialValue={1} help="受服务器性能制约，若输入图片较大，后九种风格可能会运行失败">
                            <Radio.Group name="radiogroup">
                            <Radio value={1}>原图</Radio>
                            <Radio value={2}>素描</Radio>
                            <Radio value={3}>线稿</Radio>
                            <Radio value={4}>动漫</Radio>
                            <Radio value={5}>星空</Radio>
                            <Radio value={6}>糖果</Radio>
                            <Radio value={7}>羽毛</Radio>
                            <Radio value={8}>镶嵌</Radio>
                            <Radio value={9}>谬斯</Radio>
                            <Radio value={10}>呐喊</Radio>
                            <Radio value={11}>海浪</Radio>
                            <Radio value={12}>乌迪妮</Radio>
                            <Radio value={13}>康丁斯基</Radio>
                            </Radio.Group>
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