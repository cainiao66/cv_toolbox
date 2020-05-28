import cv2
import numpy as np
import os

def Basic(input_path,file_name,brightness_mode,brightness,style):
    path = './output/' + file_name[:-4]+'/'
    isExists = os.path.exists(path)
    if not isExists:
        os.makedirs(path)
    img = cv2.imread(input_path+file_name)
    if(brightness_mode == '2'):
        img = ImgEqualize(img)
    if(style=='2'):
        img = Img2Stech(img)
    elif(style=='3'):
        img = Img2Line(img)
    elif(style=='4'):
        img = Img2Anime(img)
    elif(style=='5'):
        img=Img2Gogh(img)
    if(brightness_mode == '3'):
        gamma = 10.0/float(brightness)
        img = ImgBrighten(img,gamma)
    cv2.imwrite(path+file_name,img)
    return img

# 图像均衡化
def ImgEqualize(img):
    img_rgb = img
    img_ycrcb = cv2.cvtColor(img_rgb, cv2.COLOR_BGR2YCR_CB)
    channels = cv2.split(img_ycrcb)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    print(channels[0])
    clahe.apply(channels[0], channels[0])
    cv2.merge(channels, img_ycrcb)
    img_result = cv2.cvtColor(img_ycrcb, cv2.COLOR_YCR_CB2BGR)
    return img_result

# 亮度调节
def ImgBrighten(img,gamma):
    img_rgb = img
    fi = img_rgb / 255.0
    out = np.power(fi, gamma)
    img_result = out * 255.0
    return img_result

# 素描
def Img2Stech(img):
    img_rgb = img
    img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_BGR2GRAY)
    img_blur = cv2.GaussianBlur(img_gray, ksize=(21, 21), sigmaX=0, sigmaY=0)
    img_blend = cv2.divide(img_gray, img_blur, scale=256)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_result = clahe.apply(img_blend)
    img_result = cv2.cvtColor(img_result, cv2.COLOR_GRAY2BGR)
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    img_result = cv2.filter2D(img_result, -1, kernel)
    img_result = cv2.medianBlur(img_result, 3)
    return img_result

# 线稿
def Img2Line(img):
    img_rgb = img
    # use bilateral filter to smooth and hold border info at mean time
    img_color = img_rgb
    # convert to gray image and blur
    img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    # detect border and enhance border
    img_edge = cv2.adaptiveThreshold(img_gray,
                                     255,
                                     cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                     cv2.THRESH_BINARY,
                                     blockSize=15,
                                     C=2)
    # gray image to RGB
    img_edge = cv2.cvtColor(img_edge, cv2.COLOR_GRAY2RGB)
    img_cartoon = cv2.bitwise_and(img_color, img_edge)
    return img_edge


# 动漫
def Img2Anime(img):
    img_rgb = img
    # use bilateral filter to smooth and hold border info at mean time
    img_color = img_rgb
    img_color = cv2.bilateralFilter(img_color, d=3, sigmaColor=5, sigmaSpace=4)
    # convert to gray image and blur
    img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    img_blur = cv2.medianBlur(img_gray, 9)
    # detect border and enhance border
    img_edge = cv2.adaptiveThreshold(img_blur,
                                     255,
                                     cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                     cv2.THRESH_BINARY,
                                     blockSize=15,
                                     C=2)
    # gray image to RGB
    img_edge = cv2.cvtColor(img_edge, cv2.COLOR_GRAY2RGB)
    img_cartoon = cv2.bitwise_and(img_color, img_edge)
    return img_cartoon


# 梵高星空
def Img2Gogh(img):
    # 加载模型
    net = cv2.dnn.readNetFromTorch('./model/starry_night.t7')
    net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
    # 读取图片
    image = img
    (h, w) = image.shape[:2]
    blob = cv2.dnn.blobFromImage(image, 1.0, (w, h), (103.939, 116.779, 123.680), swapRB=False, crop=False)
    # 进行计算
    net.setInput(blob)
    out = net.forward()
    out = out.reshape(3, out.shape[2], out.shape[3])
    out[0] += 103.939
    out[1] += 116.779
    out[2] += 123.68
    out = out.transpose(1, 2, 0)
    return out
