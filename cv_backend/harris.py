import cv2
import numpy as np
import os

def Harris(file,if_dilate,threshold):
    img = cv2.imread('./upload/' + file[:-4] + '/'+file[:-4]+'.png')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = np.float32(gray)
    dst = cv2.cornerHarris(gray, 2, 3, 0.04)
    if if_dilate:
        dst = cv2.dilate(dst, None)
    img[dst > threshold * dst.max()] = [0, 0, 255]
    path = './output/' + file[:-4]+'/'
    isExists = os.path.exists(path)
    if not isExists:
        os.makedirs(path)
    cv2.imwrite(path +file[:-4]+'.jpg',img)
    return img