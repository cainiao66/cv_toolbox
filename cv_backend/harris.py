import cv2
import numpy as np

def Harris(file,if_dilate,threshold):
    img = cv2.imread('./upload/'+file)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = np.float32(gray)
    dst = cv2.cornerHarris(gray, 2, 3, 0.04)
    if if_dilate:
        dst = cv2.dilate(dst, None)
    img[dst > threshold * dst.max()] = [0, 0, 255]
    cv2.imwrite('./output/'+file,img)
    return img