from flask import Flask, jsonify, abort, request, make_response, url_for,redirect, render_template,Response
from werkzeug.utils import secure_filename
from flask_cors import CORS
from sift import Sift
from harris import Harris
import os
import base64
from stitch import Stitch
from stitch import Stitch2
from basic import Basic
from yolo_detect import YoloDetect

app = Flask(__name__)
CORS(app, resources=r'/*')


@app.route("/cv")
def hello():
    return render_template("index.html")

@app.route('/cv_upload',methods=['POST', 'GET'])
def upload():
    if request.method == 'POST':
        file = request.files['file']
        if file:
            files = os.listdir('./upload/')
            filename = str(len(files)) + '.png'
            path = './upload/' + filename[:-4] + '/'
            isExists = os.path.exists(path)
            if not isExists:
                os.makedirs(path)
            file.save(path+filename)
            return jsonify(filename)
        else:
            return jsonify("fail")

@app.route('/cv_basic',methods=['POST'])
def cv_basic():
    data = request.get_json(silent=True)
    image = data['image']
    brightness_mode = str(data['pic_brightness_mode'])
    if(brightness_mode == '3'):
        brightness = str(data['pic_brightness'])
    else:
        brightness = str(10)
    style = str(data['pic_style'])
    img = Basic('./upload/'+image[:-4]+'/',image,brightness_mode,brightness,style)
    with open('./output/'+image[:-4]+'/'+image[:-4]+'.jpg','rb') as f:
        f = f.read()
        img_stream = base64.b64encode(f).decode()
    return img_stream

@app.route('/cv_sift',methods=['POST'])
def cv_sift():
    data = request.get_json(silent=True)
    image = data['image']
    img = Sift(image)
    with open('./output/'+image[:-4]+'/'+image[:-4]+'.jpg','rb') as f:
        f = f.read()
        img_stream = base64.b64encode(f).decode()
    return img_stream

@app.route('/cv_harris',methods=['POST'])
def cv_harris():
    data = request.get_json(silent=True)
    image = data['image']
    if(data['if_dilate']=="true"):
        if_dilate = True
    else:
        if_dilate = False
    threshold = float(data['threshold'])
    img = Harris(image,if_dilate,threshold)
    with open('./output/'+image[:-4]+'/'+image[:-4]+'.jpg','rb') as f:
        f = f.read()
        img_stream = base64.b64encode(f).decode()
    return img_stream

@app.route('/cv_stitch',methods=['POST'])
def cv_stitch():
    '''
        -1: 匹配点数目不足
        -2：匹配异常
    '''
    data = request.get_json(silent=True)
    print(data)
    images = data['image']
    direction = str(data['direction'])
    if(data['pic_num']==2):
        color_adjust = str(data['color_adjust'])
        flag = Stitch(images[0],images[1],images[0],direction,color_adjust)
        if flag == -2:
            flag2 = Stitch(images[1], images[0], images[0], direction, color_adjust)
            if flag2 != 0:
                return jsonify("-2")
        elif flag == -1:
            return jsonify("-1")
    else:
        mode=str(data['mode'])
        flag = Stitch2(images,images[0],mode,direction)
        if flag == -2:
            return jsonify("-2")
    brightness_mode = str(data['pic_brightness_mode'])
    if(brightness_mode == '3'):
        brightness = str(data['pic_brightness'])
    else:
        brightness = str(10)
    style = str(data['pic_style'])
    img = Basic('./output/'+images[0][:-4]+'/',images[0][:-4]+'.jpg',brightness_mode,brightness,style)
    with open('./output/'+images[0][:-4]+'/'+images[0][:-4]+'.jpg','rb') as f:
        f = f.read()
        img_stream = base64.b64encode(f).decode()
    return img_stream

@app.route('/cv_yolo',methods=['POST'])
def cv_yolo():
    data = request.get_json(silent=True)
    print(data)
    image = data['image']
    threshold = float(data['threshold'])
    YoloDetect('./upload/'+image[:-4],threshold)
    with open('./output/'+image[:-4]+'/'+image[:-4]+'.jpg','rb') as f:
        f = f.read()
        img_stream = base64.b64encode(f).decode()
    return img_stream

# @app.route('/cv_stitch_progress',methods=['POST'])
# def cv_stitch_progress():
#     data = request.get_json(silent=True)
#     image = data['image']
#     try:
#         outfile = './output/'+image+'.txt'
#         with open(outfile, 'r') as file:
#             lines = file.readlines()
#             try:
#                 msg = lines[0]
#             except IndexError:
#                 msg = 0
#     except FileNotFoundError:
#         msg = 0
#     print("msg",msg)
#     return jsonify(msg)


if __name__ == "__main__":
    app.run(host='127.0.0.1',port=5000)


