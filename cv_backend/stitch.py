import cv2
import numpy as np
import math
import os
import time

MIN_MATCH_COUNT = 20

# def StitchPics(files,name,direction,color_adjust):
#     temp = []
#     total = len(files)*(len(files)-1)/2+1
#     step = 0
#     for i in range(0,len(files)):
#         img = cv2.imread('./upload/' + files[i],1)
#         temp.append(img)
#     flag,step,newtemp = StitchTwoPics(temp,name,direction,color_adjust,total,step)
#     if flag==False:
#         return False
#     while(len(newtemp)>=2):
#         flag,step,newtemp = StitchTwoPics(newtemp,name,direction,color_adjust,total,step)
#         if flag == False:
#             return False
#     if(len(newtemp)==1):
#         cv2.imwrite('./output/' + name, newtemp[0])
#
# def StitchTwoPics(temp,name,direction,color_adjust,total,step):
#     newtemp = []
#     for i in range(0, len(temp)-1, 1):
#         flag, res = Stitch(temp[i + 1], temp[i], direction, color_adjust)
#         step += 1
#         print(step)
#         outfile = './output/' + name + '.txt'
#         with open(outfile, 'w') as file:
#             percent = math.floor(step / total * 100)
#             file.write(str(percent))
#         if flag == False:
#             return False, step, []
#         newtemp.append(res)
#     return True,step,newtemp

def Stitch2(filenames,name):
    time1 = time.time()
    imgs = []
    for img_name in filenames:
        img = cv2.imread('./upload/'+img_name,1)
        imgs.append(img)
    stitcher = cv2.createStitcher(cv2.Stitcher_PANORAMA)  # cv.Stitcher_SCANS
    status, pano = stitcher.stitch(imgs)
    if status != cv2.Stitcher_OK:
        print("Can't stitch images, error code = %d" % status)
        return -2
    path = './output/' + name[:-4]+'/'
    isExists = os.path.exists(path)
    if not isExists:
        os.makedirs(path)
    cv2.imwrite(path+name, pano);
    print("stitch2:",time.time()-time1)

def Stitch(file1,file2,name,direction,color_adjust):
    time1 = time.time()
    img2 = cv2.imread('./upload/' + file1, 1)
    img1 = cv2.imread('./upload/' + file2, 1)
    sift = cv2.xfeatures2d.SIFT_create()
    kp1, des1 = sift.detectAndCompute(img1, None)
    kp2, des2 = sift.detectAndCompute(img2, None)
    index_params = dict(algorithm=1, trees=5)
    search_params = dict(checks=50)
    flann = cv2.FlannBasedMatcher(index_params, search_params)
    matches = flann.knnMatch(des1, des2, k=2)

    good = []
    for m, n in matches:
        if m.distance < 0.7 * n.distance:
            good.append(m)

    if len(good)<MIN_MATCH_COUNT:
        return -1

    # 单应性实际应用
    # 改变数组的表现形式，不改变数据内容，数据内容是每个关键点的坐标位置
    src_pts = np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    # findHomography 函数是计算变换矩阵
    # 参数cv2.RANSAC是使用RANSAC算法寻找一个最佳单应性矩阵H，即返回值M
    # 返回值：M 为变换矩阵，mask是掩模
    M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
    # 获取img1的图像尺寸
    h, w, c = img1.shape
    # pts是图像img1的四个顶点
    pts = np.float32([[0, 0], [0, h - 1], [w - 1, h - 1], [w - 1, 0]]).reshape(-1, 1, 2)
    # 计算变换后的四个顶点坐标位置
    dst = cv2.perspectiveTransform(pts, M)

    # 降维处理
    b = np.int32(dst).reshape(4, 2)
    #print(b)
    x, y, c = img2.shape
    # 根据变换矩阵将图像img1进行变换处理
    if(direction == '1'):
        img_transformA = cv2.warpPerspective(img1, M, (max(0,b[2][0],b[3][0]), x))
        res = np.zeros((x, img_transformA.shape[1], 3), dtype='uint8')
    else:
        img_transformA = cv2.warpPerspective(img1, M, (y, max(0,b[1][1],b[2][1])))
        res = np.zeros((img_transformA.shape[0],y,3),dtype='uint8')
    # print(res.shape)
    # print(img_transformA.shape)
    # print(img2.shape)
    # np.copyto(res[0:img_transformA.shape[0],0:img_transformA.shape[1],:],img_transformA)
    # np.copyto(res[0:img2.shape[0],0:img2.shape[1],:],img2)
    try:
        np.copyto(res[0:img_transformA.shape[0],0:img_transformA.shape[1],:],img_transformA)
        np.copyto(res[0:img2.shape[0],0:img2.shape[1],:],img2)
    except ValueError:
        return -2
    res = cv2.merge([res[:,:,0],res[:,:,1],res[:,:,2]])

    if(color_adjust == 'True' and direction == '1'):
        start = min(b[1][0],b[2][0])
        processWidth = y - start;
        alpha = 1
        for i in range(0,x):
            for j in range(start,y):
                if(img_transformA[i,j,0]==0 and img_transformA[i,j,1]==0 and img_transformA[i,j,2]==0):
                    alpha = 1
                else:
                    alpha = (processWidth - (j - start)) / processWidth
                res[i,j,:] = img2[i,j,:] * alpha + img_transformA[i,j,:] * (1 - alpha)
    elif (color_adjust == 'True' and direction == '2'):
        start = min(b[0][1],b[2][1])
        processWidth = x - start;
        alpha = 1
        for i in range(0,y):
            for j in range(start,x):
                if(img_transformA[j,i,0]==0 and img_transformA[j,i,1]==0 and img_transformA[j,i,2]==0):
                    alpha = 1
                else:
                    alpha = (processWidth - (j - start)) / processWidth
                res[j,i,:] = img2[j,i,:] * alpha + img_transformA[j,i,:] * (1 - alpha)
    path = './output/' + name[:-4]+'/'
    isExists = os.path.exists(path)
    if not isExists:
        os.makedirs(path)
    cv2.imwrite(path+name, res)
    print("stitch1:",time.time()-time1)
    return 0



if __name__ == '__main__':
    files = ['0.jpg','1.jpg']
    name = files[0]
    direction = '2'
    color_adjust = 'True'
    Stitch(files[0],files[1], name, direction, color_adjust)
    Stitch2(files,name)


