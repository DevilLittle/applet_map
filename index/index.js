Page({
    data: {
        showMarkIcon: true, // 选取路径标记图标
        showIpnutModal: false, //输入poi名称Modal
        latitude: '',
        longitude: '',
        markers: [],
        mapStyle: '',
        polyline: [],

        inputFocus: false, // input 框的focus状态
        searchText: '', // input 框的输入内容
        inputInfo: '请输入此标记点的poi', // cover-view 显示的 input 的输入内容
        isClickConfirm: false, //是否点击确定
    },
    /**
     * 自实现监听器
     */
    watch: {
        inputInfo: function (newValue) {
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

        this.getMapStyle();

        this.getLocation();
    },

    /**
     * 获取真机的窗口宽高,为地图样式赋初值
     */
    getMapStyle() {
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    mapStyle: `width:${res.windowWidth}px;height:${res.windowHeight}px;`
                })
            },
        });
    },
    /**
     * 获取当前位置
     */
    getLocation() {
        wx.getLocation({
            type: 'gcj02',
            success: (res) => {
                console.log(res);
                this.setData({
                    latitude: res.latitude,
                    longitude: res.longitude
                });
            },
            fail: res => {
                console.log(res);
            }
        })
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
                this.connectPoly(res);

                this.setData({
                    markers: chooseMarkers,
                    showIpnutModal: true,
                    inputInfo: '',
                    showMarkIcon: false
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

    poiInputDetermine: function () {
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
            latitude: chooseMarkers[chooseMarkers.length - 1].latitude,
            longitude: chooseMarkers[chooseMarkers.length - 1].longitude,
            label: {
                content: this.data.inputInfo,
                color: '#FF0000DD'
            },
            iconPath: '../image/location-green.png'
        };

        chooseMarkers.splice(chooseMarkers.length - 1, 1, mark);

        this.setData({
            showIpnutModal: false,
            showMarkIcon:true,
            markers: chooseMarkers
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
        getApp().setWatcher(this.data, this.watch, this); // 设置监听器
        this.setData({
            inputInfo: val.detail.value || '输入'
        });
    }
    
})