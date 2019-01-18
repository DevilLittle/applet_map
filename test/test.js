Page({
  data: {
    name: "xuyang"
  },
  onLoad() {
    getApp().setWatcher(this.data, this.watch); // 设置监听器
    this.setData({
      name: 'lxm'
    })
  },
  watch: {
    name: function (newValue) {
      console.log(newValue); // name改变时，调用该方法输出新值。
    }
  }
})