let proxyObj={};
proxyObj['/ws']={
  ws:true,
  target:"ws://localhost:8888"
};
proxyObj['/api']={
  ws:false,
  target:'http://localhost:8888',
  changeOrigin: true,
  pathRewrite:{
    '^/api':''
  }
}
module.exports={
  devServer:{
    host:'localhost',
    port:8080,
    proxy:proxyObj
  }
}
