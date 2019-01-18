App({
  globalData: {
    userInfo:null
  },
  onReady() {
  },

  /**
     * 设置监听器
     */
  setWatcher(data, watch,context) { // 接收index.js传过来的data对象和watch对象
    Object.keys(watch).forEach(v => { // 将watch对象内的key遍历
      this.observe(data, v, watch[v],context); // 监听data内的v属性，传入watch内对应函数以调用
    })
  },

  /**
   * 监听属性 并执行监听函数
   */
  observe(obj, key, watchFun,context) {
    var val = obj[key]; // 给该属性设默认值
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        val = value;
        watchFun.call(context,value, val); // 赋值(set)时，调用对应函数
      },
      get: function () {
        return val;
      }
    })
    }
})