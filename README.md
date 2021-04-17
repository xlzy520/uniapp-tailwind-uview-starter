# uniapp-tailwind-uview-starter
利用uniapp+tailwindcss+uview搭建的一套基础模板内置了

1. tailwindcss以及flex布局的css工具拓展
2. 基本的列表和表单demo
3. 统一的request api请求处理，枚举与正则校验


背景：之前用`uniapp`+`uview`开发了一大一小两个小程序，`css`方案用的原子风格的，发现用的还是挺爽的，就在想能不能用上`tailwindcss`，研究之后发现用`Hbuilder`创建的自由度比较低，于是选择了用`Vue-cli4`搭建了一套。

要求：
**1. Node.js > 12**

### 项目地址
[github](https://github.com/xlzy520/uniapp-tailwind-uview-starter)

### 预览
[demo](https://xiaojuzi.fun/uniapp-tailwind-uview-starter)
![1](https://i0.hdslb.com/bfs/album/0eabcc1cbdead3a5a98662ef2757760af6280bc5.png)

### 启动
第一步：`yarn`，安装所需依赖
#### h5
```bash
yarn run serve
```
#### 小程序
```bash
yarn run dev:mp-weixin
```
然后打开微信开发者工具选择`/dist/dev/mp-weixin`文件夹


### 项目初始化

[在Webstorm中或者Vscode中开发uniapp](https://ask.dcloud.net.cn/article/36307)

我选择了默认模板。

我的Webstorm默认使用`pnpm`包管理，这是**第一个坑**，启动项目时报错，于是`rm -rf node_modules`，重新使用`yarn `安装依赖，然后`npm serve`正常启动。

**第二个坑是**要求`Webstorm`设置`Nodejs v12`以上，否则`tailwind`不会智能提示。

如果是想要启动微信小程序的话，选择`dev:mp-weixin`，然后进入微信开发者工具选择`dist`包

![](https://i0.hdslb.com/bfs/album/4dd0df9f0f40695d357731927c561a66d9ca6eaf.png)



### 安装tailwindcss

主要安装如下依赖，因为一些Bug，我锁定了`autoprefixer`的版本为`8.0.0`

```bash
yarn add tailwindcss autoprefixer postcss
```

![](https://i0.hdslb.com/bfs/album/9d89a0259211d652533456de275cbfbde8fd9510.png)



### 添加配置

默认配置了两套，一套是专门用于小程序的，生成的tailwindcss没那么大，一套是完整的h5+小程序的

1. 添加`tailwind.config.js`，配置较多，可以前往项目查看

2. 添加`postcss.config.js`

   ```js
   const path = require('path')
   
   module.exports = {
     // syntax: "postcss-scss",
     parser: require('postcss-comment'),
     plugins: [
       require('postcss-import')({
         resolve (id, basedir, importOptions) {
           if (id.startsWith('~@/')) {
             return path.resolve(process.env.UNI_INPUT_DIR, id.substr(3))
           } else if (id.startsWith('@/')) {
             return path.resolve(process.env.UNI_INPUT_DIR, id.substr(2))
           } else if (id.startsWith('/') && !id.startsWith('//')) {
             return path.resolve(process.env.UNI_INPUT_DIR, id.substr(1))
           }
           return id
         }
       }),
       require('@dcloudio/vue-cli-plugin-uni/packages/postcss'),
       require("tailwindcss")({ config: "./tailwind.config.js" }),
       require('autoprefixer')({
         remove: process.env.UNI_PLATFORM !== 'h5'
       }),
       require("postcss-class-rename")({
         "\\\\:": "--",
         "\\\\/": "_",
       }),
     ]
   }
   ```

3. 新建styles文件夹，新增`tailwind.css`，并在`main.js`中引入

   ```js
   import "@/style/tailwind.css"; // main.js
   ```



   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. 配置`jsconfig.json`，可以设置`alias`别名

   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     },
     "exclude": ["node_modules", "dist"]
   }
   ```

5. 配置`ESLint`

   ```js
   globals: {
     /**/
     uni: true, // 避免全局uni.xx报错
   },
   ```



此时已经可以启动项目了查看效果了



### 安装Uview

[官方文档](https://github.com/YanxinNet/uView)

坑：

1. 官方第2、3步：`@import "uview-ui/index.scss";`改为`@import "~uview-ui/index.scss";`uview前面增加`~`
2. 第4步，我们是npm方式，npm安装的方式无需"@/"
3. uview没有代码提示，需要新增一个uview-comp.js，全部引入注册，不需要引入main.js，因为只是为了代码提示。
