from flask import Flask, jsonify, abort, request, make_response, url_for,redirect, render_template,Response
from werkzeug.utils import secure_filename
from flask_cors import CORS
from sift import Sift
from harris import Harris
import os
import base64
from stitch import Stitch
from stitch import Stitch2

app = Flask(__name__)
CORS(app, resources=r'/*')
app.config['UPLOAD_FOLDER'] = './upload'


@app.route("/cv")
def hello():
    return render_template("index.html")

@app.route('/cv_upload',methods=['POST', 'GET'])
def upload():
    if request.method == 'POST':
        file = request.files['file']
        if file:
            files = os.listdir(app.config['UPLOAD_FOLDER'])
            filename = str(len(files)) + '.jpg'
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return jsonify(filename)
        else:
            return jsonify("fail")

@app.route('/cv_sift',methods=['POST'])
def cv_sift():
    data = request.get_json(silent=True)
    image = data['image']
    img = Sift(image)
    with open('./output/'+image,'rb') as f:
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
    with open('./output/'+image,'rb') as f:
        f = f.read()
        img_stream = base64.b64encode(f).decode()
    return img_stream

@app.route('/cv_stitch',methods=['POST'])
def cv_stitch():
    '''
        -1: 匹配点数目不足
        -2：匹配异常
        -3：暂不支持多图拼接
    '''
    data = request.get_json(silent=True)
    images = data['image']
    if(data['pic_num']==2):
        direction = str(data['direction'])
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
        flag = Stitch2(images,images[0],mode)
        if flag == -2:
            return jsonify("-2")
    with open('./output/'+images[0][:-4]+'/'+images[0],'rb') as f:
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


