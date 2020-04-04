module.exports = {
  dbs:'mongodb://127.0.0.1:27017/zhihu',
  redis:{
    get host(){
      return '127.0.0.1'
    },
    get port(){
      return 6379
    }
  },
  smtp:{
    get host(){
      return 'smtp.qq.com'
    },
    get user(){
      return '663695877@qq.com'
    },
    get pass(){
      return 'gqjvokqhexfjbeai'
    },
    get code(){
      return ()=>{
        return Math.random().toString(16).slice(2,6).toUpperCase()
      }
    },
    get expire(){
      return ()=>{
        return new Date().getTime()+60*60*1000
      }
    }
  },
  security: {
    secretKey: '@2Wd%e9Cd3s.P,&1!',
    expiresIn: 60 * 60 * 24 * 7
  },
}
