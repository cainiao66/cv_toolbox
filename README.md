# cv_toolbox

### 简介

计算机视觉工具箱

- [x] Sift 尺度不变特征检测
- [x] Harris 角点检测
- [ ] 全景拼接(Panorama Stitching)
	- [x] 两张图片横向拼接(无视输入顺序)
	- [x] 色差调整
	- [ ] 两张图片纵向拼接
	- [ ] 多张图片拼接
	- [ ] 视频全景拼接


### 运行

##### 前端

```c++
npm install tyarn
cd cv_front
tyarn
yarn start
// build
npm run build
```

##### 后端

```c++
//python 3.6.9
cd cv_backend
pip install flask
pip install base64
pip install werkzeug
pip install flask_cors 
pip install opencv-python==3.4.4
pip install opencv-contrib-python==3.4.2.16
python myproject.py
```

