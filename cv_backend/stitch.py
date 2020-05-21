import cv2
import numpy as np

MIN_MATCH_COUNT = 20

def Stitch(file1,file2,name):
    img1 = cv2.imread('./upload/' + file1,1)
    img2 = cv2.imread('./upload/' + file2,1)
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
        return False

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
    print(b)
    x, y, c = img2.shape
    # 根据变换矩阵将图像img1进行变换处理
    img_transformA = cv2.warpPerspective(img1, M, (max(b[2][0],b[3][0]), x))
    print(img_transformA.shape)
    res = np.zeros((x,img_transformA.shape[1],3),dtype='uint8')
    try:
        np.copyto(res[0:img_transformA.shape[0],0:img_transformA.shape[1],:],img_transformA)
        np.copyto(res[0:img2.shape[0],0:img2.shape[1],:],img2)
    except ValueError:
        return False
    res = cv2.merge([res[:,:,0],res[:,:,1],res[:,:,2]])

    start = min(b[1][0],b[2][0])
    processWidth = y - start;
    alpha = 1
    for i in range(0,x):
        for j in range(start,y):
            if(img_transformA[i,j,0]==0 and img_transformA[i,j,1]==0 and img_transformA[i,j,2]==0):
                alpha = 1
            else:
                alpha = (processWidth - (j - start)) / processWidth
            res[i,j,:] = img2[i,j,:] * alpha + img_transformA[i,j,:] * (1 - alpha);


    cv2.imwrite('./output/'+name,res)
    return True


    # img1 = cv2.imread('./upload/' + file1,0)
    # img2 = cv2.imread('./upload/' + file2,0)
    # sift = cv2.xfeatures2d.SIFT_create()
    # keypoints1,descriptor1 = sift.detectAndCompute(img1,None)
    # keypoints2,descriptor2 = sift.detectAndCompute(img2,None)
    # matcher = cv2.BFMatcher(normType=cv2.NORM_L1, crossCheck=True)
    # matches = matcher.match(descriptor1, descriptor2)
    # matches = sorted(matches, key=lambda x: x.distance)
    # good_matches = matches[:min(60,len(matches)*0.2)]
    # match_img = cv2.drawMatches(img1=img1,keypoints1=keypoints1,
    #                             img2=img2,keypoints2=keypoints2, matches1to2=good_matches, outImg=img2, flags=2)
    # img_points1 = []
    # img_points2 = []
    # if len(good_matches<MIN_MATCH_COUNT):
    #     print("Not enough matches are found - %d/%d") % (len(good), MIN_MATCH_COUNT)
    #     return False
    # for i in range(0,len(good_matches)):
    #     img_points1.append(keypoints1[good_matches[i].trainIdx].pt)
    #     img_points2.append(keypoints2[good_matches[i].queryIdx].pt)
    # M, mask = cv2.findHomography(img_points1, img_points2, cv2.RANSAC, 5.0)



if __name__ == '__main__':
    flag = Stitch('img1.bmp','img2.bmp','img1.bmp')
    if flag == False:
        flag2 = Stitch('img2.bmp','img1.bmp','img1.bmp')
    print(flag2)

