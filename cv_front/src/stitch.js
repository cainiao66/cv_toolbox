import './App.css';
import React from 'react';
import PicturesWall from './pics'
import {Form,Button, Typography, Divider,Row, Col,Card,Empty,message,Spin,Switch,Radio,PageHeader,Slider} from 'antd';
import axios from "axios";
import { DownloadOutlined } from '@ant-design/icons';
import './config.js'
const {  Paragraph} = Typography;
var baseUrl = global.url.baseUrl

const IconLink = ({ src, text }) => (
  <a className="example-link">
    <img className="example-link-icon" src={src} alt={text} />
    {text}
  </a>
);

export default class Sift extends React.Component{
  formItemLayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 12 },
  };

  direction_text = <Form.Item name="direction" label="拼接方式" initialValue={1}>
                      <Radio.Group name="radiogroup">
                        <Radio value={1}>横向拼接</Radio>
                        <Radio value={2}>纵向拼接</Radio>
                      </Radio.Group>
                    </Form.Item>;

  color_text =  <Form.Item name="color_adjust" label="色差调节" help="开启可自动调节图片色彩差异，提高拼接效果，建议开启" initialValue={true}>
                  <Switch defaultChecked/>
                </Form.Item>;

  mode_text = <Form.Item name="mode" label="拼接模式" help="全景模式适合拼接相机照片（透视变换），扫描模式适合拼接扫描图片（仿射变换）" 
  initialValue={1}>
                <Radio.Group name="radiogroup">
                  <Radio value={1}>全景模式</Radio>
                  <Radio value={2}>扫描模式</Radio>
                </Radio.Group>
              </Form.Item>;

  brightness_text = <Form.Item name="pic_brightness" label="图像亮度" initialValue={10} help="亮度值为10则不变，小于10变暗，大于10变亮">
                      <Slider min={1} max={20}/>
                    </Form.Item>;

  state = {
    pics:[],
    out_pic:null,
    output:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
    pic_help:"",
    pic_num:2,
    direction:this.direction_text,
    color: this.color_text,
    mode:<div></div>,
    brightness:<div></div>
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

  openDoc = (val)=>{
    this.props.parent.getChildrenMsg(this,2)
  }



  onFinish = values => {
    if(this.state.pics.length<2){
      /*错误提示*/ 
      message.info("请输入至少两张图片");
    }
    else if(this.state.pics.length>this.state.pic_num){
      message.info("双图拼接最多输入两张图片");
    }
    else{
      this.setState({
        output:<Spin></Spin> 
      })
      console.log('Received values of form: ', values);
      axios({
        method: 'post',
        url: baseUrl+'/cv_stitch',
        data: {
          'image':this.state.pics,
          'pic_num':values.pic_num,
          'color_adjust':values.color_adjust,
          'direction':values.direction,
          'mode':values.mode,
          'pic_brightness_mode':values.pic_brightness_mode,
          'pic_brightness':values.pic_brightness,
          'pic_style':values.pic_style,
        },
      })
      .then((res) => {
        if(res.data=="-1"){
          message.error("拼接失败！图片匹配度不够");
          this.setState({
            output:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
          })
        }
        else if(res.data=='-2'){
          message.error("拼接失败！图片匹配异常");
          this.setState({
            output:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
          })
        }
        else if(res.data=='-3'){
          message.error("拼接失败！暂不支持多图拼接");
          this.setState({
            output:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
          })
        }
        else{
          this.setState({
            out_pic:"data:image/jpg;base64,"+res.data,
          })
          this.setState({
            output: <Card hoverable cover={<img src={this.state.out_pic} />}><Button onClick={this.downloadPic} block type="primary" icon={<DownloadOutlined />} >Download</Button> </Card> 
          })
        }
      })
      .catch((error) => {
        message.error("网络错误或服务器故障，请重试或联系开发者！");
        this.setState({
          output:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        })
      })
    }
  };

  onChange = e =>{
    console.log(e.target.value)
    if(e.target.value === 2){
      this.setState({
        color:this.color_text,
        mode:<div></div>,
      });
    }
    else{
      this.setState({
        color:<div></div>,
        mode:this.mode_text,
      });
    }
    this.setState({
      pic_num: e.target.value,
    });
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

  render(){
    return (
        <Typography>
          <PageHeader
            title="图片全景拼接"
            style={{paddingLeft:'0px',paddingBottom:'0px'}}
            extra={[
              <Button key="1" type="link" onClick={this.openDoc}>
                <IconLink src="https://gw.alipayobjects.com/zos/rmsportal/ohOEPSYdDTNnyMbGuyLb.svg" text=" Doc"/>
              </Button>
            ]}
          ></PageHeader>
          <Divider />
          <Paragraph>
            目前支持双图拼接和多图拼接（最多8张图片）两种模式，双图拼接支持横向纵向两种模式，多图拼接目前只支持横向拼接
          </Paragraph>
          <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={11}>
              <Card title="输入" bordered={true} style={{height:'100%'}}>
                <Form {...this.formItemLayout} onFinish={this.onFinish}>
                  <Form.Item name="pic_num" label="图片数目" initialValue={2}>
                    <Radio.Group name="radiogroup" onChange={this.onChange}>
                      <Radio value={2}>双图拼接</Radio>
                      <Radio value={8}>多图拼接</Radio>
                    </Radio.Group>
                  </Form.Item>
                  {this.state.direction}
                  {this.state.color}
                  {this.state.mode}
                  <Form.Item name="pic_brightness_mode" label="亮度调节" initialValue={1} help="亮度值为10则不变，小于10变暗，大于10变亮">
                    <Radio.Group name="radiogroup" onChange={this.onChangeBrightness}>
                      <Radio value={1}>不变</Radio>
                      <Radio value={2}>自动调节</Radio>
                      <Radio value={3}>手动调节</Radio>
                    </Radio.Group>
                  </Form.Item>
                  {this.state.brightness}
                  <Form.Item name="pic_style" label="图像风格" initialValue={1}>
                    <Radio.Group name="radiogroup">
                      <Radio value={1}>原图</Radio>
                      <Radio value={2}>素描</Radio>
                      <Radio value={3}>线稿</Radio>
                      <Radio value={4}>动漫</Radio>
                      <Radio value={5}>梵高星空</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item label="上传图片"  help={this.state.pic_help}>
                    <PicturesWall max_pic={this.state.pic_num}  getChildValue={this.getPic.bind(this)}></PicturesWall>
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