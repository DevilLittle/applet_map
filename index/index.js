Page({
  data: {
    showMarkIcon: true, // 选取路径标记图标
    showIpnutModal: false, //输入poi名称Modal
    latitude: 23.099994,
    longitude: 113.324520,
    markers: [],
    mapStyle: {
      width: '100%',
      height: '1100rpx',
      position: 'relative'
    },
    polyline: [],

    inputFocus: false, // input 框的focus状态
    searchText: '', // input 框的输入内容
    inputInfo: '请输入此标记点的poi', // cover-view 显示的 input 的输入内容
    // isOutOfFocusInDetermine:false,  // 标记poiModal确定按钮点击时是否Input已失焦
    isClickConfirm:false, //是否点击确定

    selectHeight: 'height: 40px', // select 组件的高度
    selectList: [1, 2, 3, 4, 5, 6, 7, 8, 9], // select 组件的可选项
    selectInfo: '选择'  // cover-view 显示的选中的内容
  },
  /**
   * 自实现监听器
   */
  watch: {
    inputInfo: function (newValue) {
      console.log(newValue); // inputInfo改变时，调用该方法输出新值。
      console.log('watch', this);
      if (this.data.isClickConfirm) {
        this.setData({
          isClickConfirm: false
        });
        this.poiInputDetermineLogic();
      }
    }
  },

  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap');
  },
  /**
   * 连线
   */
  connectPoly: function (res) {
    let chooseMarkers = [].concat(this.data.markers);
    //连线
    let points = [];
    let polyline = [].concat(this.data.polyline);
    if (this.data.markers.length === 0) {
      points = [];
    } else {
      points = [{
        latitude: chooseMarkers[chooseMarkers.length - 1].latitude,
        longitude: chooseMarkers[chooseMarkers.length - 1].longitude,
      }, {
        latitude: res.latitude,
        longitude: res.longitude,
      }];
    }

    polyline.push({
      points: points,
      color: '#FF0000DD',
      width: 2,
      dottedLine: false
    });
    this.setData({
      polyline: polyline
    });
  },
  
  /**
   * 标记点
   */
  markLocation: function () {

    this.mapCtx.getCenterLocation({
      success: (res) => {
        if (this.data.showIpnutModal) {
          return;
        }
        let chooseMarkers = [].concat(this.data.markers);

        chooseMarkers.push({
          id: chooseMarkers.length + 1,
          latitude: res.latitude,
          longitude: res.longitude,
          iconPath: '../image/location-green.png'
        });

        //标记下一个点前先划线
        // this.connectPoly(res);

        this.setData({
          markers: chooseMarkers,
          // showIpnutModal: true,
          inputInfo:'',
          showMarkIcon:false
        });
      }
    })
  },
  backLocation: function () {
    let chooseMarkers = [].concat(this.data.markers);

    chooseMarkers.pop();
    this.setData({
      markers: chooseMarkers
    });
    this.deletePoly();
  },
  /**
   * 删除连线
   */
  deletePoly: function () {
    let polyline = [].concat(this.data.polyline);

    polyline.pop();
    this.setData({
      polyline: polyline
    });
  },

  poiInputDetermine:function(){
    // 如果 inputInfo有值就执行逻辑
    if (this.data.inputInfo) {
      this.poiInputDetermineLogic();
    } else { // 没有就设置一个标记，让watch来执行
      this.setData({
        isClickConfirm: true
      });
    }
  },
  /**
   * 输入poi名称确定
   */
  poiInputDetermineLogic: function () {    
  
    let chooseMarkers = [].concat(this.data.markers);

    let mark = {
      id: chooseMarkers.length,
      latitude: chooseMarkers[chooseMarkers.length-1].latitude,
      longitude: chooseMarkers[chooseMarkers.length - 1].longitude,
      label: {
        content: this.data.inputInfo,
        color: 'red'
      },
      iconPath: '../image/location-green.png'
    };

    console.log('logic:',this.data.inputInfo);
    chooseMarkers.splice(chooseMarkers.length - 1, 1, mark);

    this.setData({
      showIpnutModal: false,
      markers:chooseMarkers
    });
  },

  determine: function () {
    this.setData({
      showMarkIcon: false
    });

    this.mapCtx.includePoints({
      padding: [50],
      points: [{
        latitude: this.data.markers[0].latitude,
        longitude: this.data.markers[0].longitude,
      }]
    });
  },

  next() {

  },
  /**
     * 将焦点给到 input
     */
  tapInput() {
    this.setData({
      inputInfo: '',
      inputFocus: true
    });
  },
  /**
   * input 失去焦点后将 input 的输入内容给到cover-view
   */
  blurInput(val) {
    if (this.data.isOutOfFocusInDetermine) {
      this.setData({
        isOutOfFocusInDetermine: false
      });
      this.poiInputDetermineLogic();
      return;
    }
    getApp().setWatcher(this.data, this.watch,this); // 设置监听器
    this.setData({
      inputInfo: val.detail.value || '输入'
    });
  },
  /**
   * 显示 select
   */
  tapSelect() {
    this.setData({
      selectHeight: 'max-height: 200px'
    });
  },
  /**
   * 关闭 select
   */
  tapSelectClose() {
    this.setData({
      selectHeight: 'height: 40px'
    });
  },
  /**
   * 将选中的 select 内容给到 cover-view
   */
  selectItem(e) {
    let selected = e.currentTarget.dataset.item;
    this.setData({
      selectInfo: selected
    });
  }
})