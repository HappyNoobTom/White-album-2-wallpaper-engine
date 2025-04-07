# Wallpaper Engine 项目修改指南

## 项目概述
这是一个 Wallpaper Engine 项目，名为"WA2"。该项目使用 Wallpaper Engine 的标准结构，包含场景配置、着色器等内容。

## 文件结构
- `project.json`: 项目配置文件，定义项目基本属性和用户可自定义的参数
- `scene.json`: 场景配置文件，定义背景色、光照、相机等场景属性
- `shaders/`: 包含自定义着色器文件
- `scripts/`: 包含JavaScript脚本文件，用于实现交互功能
- `models/`: 包含3D模型文件
- `materials/`: 包含材质定义文件

## 可用接口及修改方法

### 1. 属性修改接口
在 `project.json` 中，可以通过 `properties` 部分添加用户可自定义的属性：

```json
"properties": {
  "mycolor": {
    "order": 1,
    "text": "自定义颜色",
    "type": "color",
    "value": "1 1 1"
  },
  "myslider": {
    "max": 100,
    "min": 0,
    "order": 2,
    "text": "自定义滑块",
    "type": "slider",
    "value": 50
  },
  "mycombo": {
    "options": [
      {
        "label": "选项1",
        "value": "option1"
      },
      {
        "label": "选项2",
        "value": "option2"
      }
    ],
    "order": 3,
    "text": "下拉选择",
    "type": "combo",
    "value": "option1"
  }
}
```

### 2. 场景设置接口
在 `scene.json` 中，可以修改以下属性：
- `ambientcolor`: 环境光颜色
- `bloom`: 是否启用泛光效果
- `bloomstrength`: 泛光强度
- `bloomthreshold`: 泛光阈值
- `camerafade`: 相机褪色效果
- `clearcolor`: 清除颜色（背景色）
- `orthogonalprojection`: 正交投影设置
- `perspectiveoverridefov`: 透视视野角度
- `skylightcolor`: 天空光颜色
- `objects`: 场景中的对象列表

### 3. JavaScript 编程接口
在 `scripts` 目录中创建 .js 文件来添加交互功能，可使用以下Wallpaper Engine API:

```javascript
// 获取属性值
wallpaperPropertyListener = {
  applyUserProperties: function(properties) {
    if (properties.mycolor) {
      // 处理颜色属性
      var color = properties.mycolor.value.split(' ');
      var r = parseInt(color[0] * 255);
      var g = parseInt(color[1] * 255);
      var b = parseInt(color[2] * 255);
      // 使用颜色值
    }
    
    if (properties.myslider) {
      // 处理滑块属性
      var value = properties.myslider.value;
      // 使用滑块值
    }
  }
};

// 响应音频输入
wallpaperRegisterAudioListener(function(audioArray) {
  // audioArray包含音频频谱数据
  // 索引0-63对应低到高频
});

// 响应鼠标输入
window.wallpaperRegisterMouseListener(function(mouseEvent) {
  // 处理鼠标事件
});
```

### 4. 着色器修改
在 `shaders` 目录中，可以添加或修改GLSL着色器文件：
- 顶点着色器(.vert)
- 片段着色器(.frag)

### 5. 添加3D对象
在 `scene.json` 的 `objects` 数组中添加3D对象：

```json
"objects": [
  {
    "id": 1,
    "type": "model",
    "model": "models/mymodel.fbx",
    "position": [0, 0, 0],
    "rotation": [0, 0, 0],
    "scale": [1, 1, 1]
  }
]
```

## 开发工具
- Wallpaper Engine 编辑器: 用于实时预览和测试项目
- 文本编辑器: 修改JSON和JavaScript文件
- 着色器编辑器: 编写和修改GLSL着色器

## 调试技巧
1. 使用Wallpaper Engine编辑器的控制台查看JavaScript错误
2. 使用编辑器的着色器调试工具检查着色器问题
3. 在编辑器中实时预览更改效果

## 更多资源
- [Wallpaper Engine 文档](https://docs.wallpaperengine.io/)
- [Wallpaper Engine 工作坊](https://steamcommunity.com/app/431960/workshop/) 