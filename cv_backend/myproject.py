from flask import Flask, jsonify, abort, request, make_response, url_for,redirect, render_template,Response
from werkzeug.utils import secure_filename
from flask_cors import CORS
from sift import Sift
from harris import Harris
import os
import base64
from stitch import Stitch

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
    data = request.get_json(silent=True)
    images = data['image']
    direction = str(data['direction'])
    color_adjust = str(data['color_adjust'])
    print(direction)
    print(color_adjust)
    flag = Stitch(images[0],images[1],images[0],direction,color_adjust)
    if flag == False:
        flag2 = Stitch(images[1],images[0],images[0],direction,color_adjust)
        if flag2 == False:
            return jsonify("fail")
    with open('./output/'+images[0],'rb') as f:
        f = f.read()
        img_stream = base64.b64encode(f).decode()
    return img_stream


if __name__ == "__main__":
    app.run(host='127.0.0.1',port=5000)


