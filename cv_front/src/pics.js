import { Upload, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';
var baseUrl = "http://localhost:5000";
//var baseUrl = "";

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export default class PicturesWall extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
      previewTitle: '',
      fileList: [],
      pics:[],
      max_pic:this.props.max_pic
    };

  }


  transformFile = (file) => {
    /**
     * 针对图片进行压缩,如果图片大小超过压缩阈值,则执行压缩,否则不压缩
     */
        const {compressThreshold = 1, isPictureCompress = true, pictureQuality = 0.92} = this.props;
        let fileSize = file.size / 1024 / 1024;
        // console.log('before compress, the file size is : ', fileSize + "M");
        //当开启图片压缩且图片大小大于等于压缩阈值,进行压缩
        if ((fileSize >= compressThreshold) && isPictureCompress) {
            //判断浏览器内核是否支持base64图片压缩
            if (typeof (FileReader) === 'undefined') {
                return file;
            } else {
                try {
                    this.setState({
                        spinLoading: true
                    });
                    return new Promise(resolve => {
                        //声明FileReader文件读取对象
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => {
                            // 生成canvas画布
                            const canvas = document.createElement('canvas');
                            // 生成img
                            const img = document.createElement('img');
                            img.src = reader.result;
                            img.onload = () => {
                                const ctx = canvas.getContext('2d');
                                //原始图片宽度、高度
                                let originImageWidth = img.width, originImageHeight = img.height;
                                //默认最大尺度的尺寸限制在（1920 * 1080）
                                let maxWidth = 1920, maxHeight = 1080, ratio = maxWidth / maxHeight;
                                //目标尺寸
                                let targetWidth = originImageWidth, targetHeight = originImageHeight;
                                //当图片的宽度或者高度大于指定的最大宽度或者最大高度时,进行缩放图片
                                if (originImageWidth > maxWidth || originImageHeight > maxHeight) {
                                    //超过最大宽高比例
                                    if ((originImageWidth / originImageHeight) > ratio) {
                                        //宽度取最大宽度值maxWidth,缩放高度
                                        targetWidth = maxWidth;
                                        targetHeight = Math.round(maxWidth * (originImageHeight / originImageWidth));
                                    } else {
                                        //高度取最大高度值maxHeight,缩放宽度
                                        targetHeight = maxHeight;
                                        targetWidth = Math.round(maxHeight * (originImageWidth / originImageHeight));
                                    }
                                }
                                // canvas对图片进行缩放
                                canvas.width = targetWidth;
                                canvas.height = targetHeight;
                                // 清除画布
                                ctx.clearRect(0, 0, targetWidth, targetHeight);
                                // 绘制图片
                                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                                // quality值越小,图像越模糊,默认图片质量为0.92
                                const imageDataURL = canvas.toDataURL(file.type || 'image/jpeg', pictureQuality);
                                // 去掉URL的头,并转换为byte
                                const imageBytes = window.atob(imageDataURL.split(',')[1]);
                                // 处理异常,将ascii码小于0的转换为大于0
                                const arrayBuffer = new ArrayBuffer(imageBytes.length);
                                const uint8Array = new Uint8Array(arrayBuffer);
                                for (let i = 0; i < imageBytes.length; i++) {
                                    uint8Array[i] = imageBytes.charCodeAt(i);
                                }
                                let mimeType = imageDataURL.split(',')[0].match(/:(.*?);/)[1];
                                let newFile = new File([uint8Array], file.name, {type: mimeType || 'image/jpeg'});
                                // console.log('after compress, the file size is : ', (newFile.size / 1024 / 1024) + "M");
                                resolve(newFile);
                            };
                        };
                        reader.onerror = () => {
                            this.setState({
                                spinLoading: false
                            });
                            return file;
                        }
                    }).then(res => {
                        this.setState({
                            spinLoading: false
                        });
                        return res;
                    }).catch(() => {
                        this.setState({
                            spinLoading: false
                        });
                        return file;
                    });
                } catch (e) {
                    this.setState({
                        spinLoading: false
                    });
                    //压缩出错,直接返回原file对象
                    return file;
                }
            }
        } else {
            //不需要压缩，直接返回原file对象
            return file;
        }
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handleChange = ({ fileList }) => {
    this.setState({ fileList});
    var my_pics = []
    for(var i=0;i<fileList.length;i++){
      if(Object.keys(fileList[i]).indexOf('response')>=0){
        my_pics.push(fileList[i].response)
      }
    }
    this.setState({
      pics:my_pics
    })
    this.props.getChildValue(this.state.pics)
  }  
  

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  render() {
    const { previewVisible, previewImage, fileList, previewTitle } = this.state;
    const uploadButton = (
      <div>
        <PlusOutlined />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <div className="clearfix">
        <Upload
          action={baseUrl+"/cv_upload"}
          listType="picture-card"
          fileList={fileList}
          transformFile={this.transformFile}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          isPictureCompress={true} //是否开启图片压缩
          pictureQuality={0.92}   //图片质量
          compressThreshold={1}  //压缩阈值
        >
          {fileList.length >= this.state.max_pic ? null : uploadButton}
        </Upload>
        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}