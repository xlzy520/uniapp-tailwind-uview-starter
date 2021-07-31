# uniapp-tailwind-uview-starter
利用uniapp+tailwindcss+uview+sass搭建的一套基础模板，并且集成了`miniprogram-ci`实现自动构建上传微信小程序。

1. tailwindcss以及flex布局的css工具拓展
2. miniprogram-ci集成，实现通过GitHub Actions自动执行脚本构建打包上传
3. 基本的列表和表单demo
4. 统一的request api请求处理，枚举与正则校验


>背景：之前用`uniapp`+`uview`开发了一大一小两个小程序，`css`方案用的原子风格的，发现用的还是挺爽的，就在想能不能用上`tailwindcss`，研究之后发现用`Hbuilder`创建的自由度比较低，于是选择了用`Vue-cli4`搭建了一套。

### 安装要求：
1. 第一步：命令行执行` yarn `或者`npm i`，安装所需依赖
2. 第二步：(非必要)去release.yml配置自动打包构建需要的秘钥，具体查看该[文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html)


### 启动
1. HBuilderX直接点击`运行`或者`发行`选择相应的平台(我的方式)
2. `webstorm`或者`vscode`启动，稍微麻烦点，具体如下
#### h5
```bash
yarn run serve
```
#### 小程序
```bash
yarn run dev:mp-weixin
```
然后打开微信开发者工具选择`/dist/dev/mp-weixin`文件夹

### Build
```bash
yarn run build:mp-weixin
```
然后打开微信开发者工具选择`/dist/build/mp-weixin`文件夹，当然最方便的是直接通过GitHub Actions自动部署，需要在GitHub中配置secret才可以自动部署小程序

### 预览
[live demo](https://xlzy520.cn/uniapp-tailwind-uview-starter)


![1](https://img-cdn-aliyun.dcloud.net.cn/stream/plugin_screens/a4a29f30-9533-11eb-b534-33a539a2c06f_0.png?v=1617533933)

### 项目地址
[github](https://github.com/xlzy520/uniapp-tailwind-uview-starter)

### 踩坑
- 我的Webstorm默认使用`pnpm`包管理，这是**第一个坑**，启动项目时报错，于是`rm -rf node_modules`，重新使用`yarn `安装依赖，然后`npm serve`正常启动。
- 要求`Webstorm`设置`Nodejs v12`以上，否则`tailwind`不会智能提示。


### 添加配置

tailwindcss默认配置了两套，一套是专门用于小程序的，生成的tailwindcss没那么大，一套是完整的h5+小程序的
`tailwind.config.js`，配置较多，可以前往项目查看
