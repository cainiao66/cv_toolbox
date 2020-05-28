
### 1 研究现状

```
主要参考知乎回答 https://www.zhihu.com/question/34535199/answer/135169187，并结合其他文献加以补充
```

#### 1.1 BROWN ICCV2003 与 IJCV2007 AutoStitch

技术：

- 全局单应矩阵

- 柱面或球面投影

- 光束平差

- 多频带融合

基本假设

- 图像重叠区域近似一个平面，虽好是整个图像近似在同一平面上

- 拍摄时相机光心几乎重合

```
Brown M, Lowe D G. Recognising Panoramas [C].ICCV,2003
```
```
Brown M, Lowe D G. Automatic Panoramic Image Stitching using Invariant Features [J].IJCV,2007.
```


#### 1.2 双单应矩阵 Dual-Homography Warping(DHW)

将场景划分为背景平面和前景平面,用两个单应性矩阵(8参数变换矩阵,能把正方形变成任意四边形)分别对齐背景和前景,这种方法可以无缝拼接大部分现实场景。

```
Gao J, Kim S J, Brown M S. Constructing image panoramas using dual-homography warping [C]. CVPR, 2011.
```

#### 1.3 多仿射变换矩阵 Smoothly Varying Affine(SVA)

11'CVPR的Smoothly Varying Affine(SVA)用多个仿射变换(6参数的变换矩阵，经过仿射变换的平行线依然平行，能把正方形变成平行四边形)，局部变形能力和对齐能力更强，具有一定处理视差的能力。

```
Lin W Y, Liu S, Matsushita Y, et al. Smoothly varying affine stitching [C]. CVPR,2011
```

#### 1.4 APAP

13'CVPR,14'PAMI的As-Projective-As-Possible(APAP)将图像划分为密集网格，每个网格都用一个单应性矩阵对齐，叫做局部单应性，并同时给出了一整套高效的计算方法Moving DLT。

```
Zaragoza J, Chin T J, Brown M S, et al. As-projective-as-possible image stitching with moving DLT [C]. CVPR, 2013.
```
```
Zaragoza J, Chin T J, Tran Q H, et al. As-projective-as-possible image stitching with moving DLT [C]. TPAMI, 2014.
```

#### 1.5  Parallax-tolerant Image Stitchin

14'CVPR的Parallax-tolerant Image Stitching 借鉴经典视频去抖方法Content-preserving warps(CPW) 的优化项和缝合线主导的13'Eurographics的Seam-driven, 大幅提高了大视差场景的拼接性能。

```
Zhang F, Liu F. Parallax-tolerant image stitching [C]. CVPR, 2014
```

#### 1.6 AANAP

15‘CVPR的Adaptive As-Natural-As-Possible(AANAP)用全局相似变换矫正形状，拼接结果的观感自然度比前几种方法提升了一个档次

```
Lin C C, Pankanti S U, Ramamurthy K N, et al. Adaptive as-natural-as-possible image stitching [C]. CVPR 2015
```

