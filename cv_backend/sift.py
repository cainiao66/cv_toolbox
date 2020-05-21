# Name: Ning Xinzhi
# Student ID: 1754225
# SIFT Algorithm implemented by the cv2 package
# Description: Get two images, taken from the same scene but with scale transformations.
#              Detect the scale invariant points on the two images.
#              Use the center of the circle to indicate the spatial position of the point
#              and use the radius of the circle to indicate the characteristic scale of the point.
# environment: python 3.7.0
#              pip install opencv-python==3.4.4
#              pip install opencv-contrib-python==3.4.2.16

import cv2

def Sift(file):
    img = cv2.imread('./upload/'+file)
    gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    sift = cv2.xfeatures2d.SIFT_create()
    keypoints,descriptor = sift.detectAndCompute(gray,None)
    img = cv2.drawKeypoints(image=img,keypoints = keypoints,outImage=img,color=(255,0,255),flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
    cv2.imwrite('./output/'+file,img)
    return img
