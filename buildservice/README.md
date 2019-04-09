# ios项目自动打包

## 规格
- 预计用时: 6分钟
- 不能挂VPN

## 关键语句

进入文件,xcodebuild没法指定文件夹
```
cp /Users/bokeadmin/project/ios-pack/routes/pack/exportOptions.plist ./
xcodebuild -project  yesapp.xcodeproj -scheme yesapp -sdk iphoneos archive -archivePath $PWD/build/yesapp.xcarchive -configuration Release
xcodebuild -exportArchive -archivePath $PWD/build/yesapp.xcarchive -exportOptionsPlist exportOptions.plist -exportPath $PWD/build
```

# 开发环境启动过程
* npm install

* 执行npm run server

* 执行nodemon server.js

# 正式环境
* npm install

* node server.js

# 服务器地址的数据库配置

  修改config.js中的相关属性即可