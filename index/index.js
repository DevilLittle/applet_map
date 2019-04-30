const Utils = require('../common/Utils.js');
const Interval = 8; // 采集时间
const collectTime = 1000; //采集时WIFI列表更新时间
let WIFISTATUS = false; // 标记WIFI初始化是否成功
let BLUETOOTHSTATUS = false; // 标记蓝牙初始化是否成功
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

        showArrivedModal: false, //到达地点提示框
        showRestartModal: false, // 重新开始提示框
        reStartInfo: '打开WIFI', // 重新开始提示信息

        showCollectModal: false, // 开始采集提示框
        collectTexts: [
            '开始收集附近WIFI和蓝牙信息',
            '正在扫描WIFI和蓝牙',
            '记录WIFI和蓝牙信息中',
            '收集完毕'

        ],
        active: -1, // 当前进度
        wifiList:[],  // 某一时刻的WIFI列表
        infoList:[],  // 所有WIFI的列表数据
        isCollecting: true,  // 标记是否正在采集中
        collectTimer:null,  // 采集循环获取列表计时器
    },
    /**
     * 自实现监听器
     */
    watch: {
        inputInfo: function(newValue) {
            if (this.data.isClickConfirm) {
                this.setData({
                    isClickConfirm: false
                });
                this.poiInputDetermineLogic();
            }
        }
    },

    onReady: function(e) {
        this.mapCtx = wx.createMapContext('myMap');

        // 地图铺满屏幕
        this.getMapStyle();
        // 获取当前所在位置
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
    connectPoly: function(res) {
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
    markLocation: function() {

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
    /**
     * 撤回
     */
    backLocation: function() {
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
    deletePoly: function() {
        let polyline = [].concat(this.data.polyline);

        polyline.pop();
        this.setData({
            polyline: polyline
        });
    },
    /**
     * 输入地点后确认
     */
    poiInputDetermine: function() {
        console.log(this.data.inputInfo);
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
    poiInputDetermineLogic: function() {

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
            showArrivedModal: true,
            showMarkIcon: false,
            markers: chooseMarkers
        });
    },

    determine: function() {
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
    },
    /**
     * 到达地点执行逻辑
     */
    arrivedLocation() {
        this.setData({
            showArrivedModal: false
        });
        this.moduleStart();
    },
    /**
     * 开始采集后各个模块工作
     */
    moduleStart(){
        if(WIFISTATUS){
            //改变状态
            this.changeActive();
            //WIFI
            this.getWifiList();
            
        }else{
            WIFISTATUS||this.detectWifiStatus();
        }
       
    },

    /**
     * 检测WIFI是否开启
     */
    detectWifiStatus(){
        wx.startWifi({
            success: (res) => {
                wx.getWifiList({
                    success:(res)=>{
                        WIFISTATUS = true;

                        if (WIFISTATUS && BLUETOOTHSTATUS){
                            this.moduleStart();
                        }
                    },
                    fail: res => {
                        let errCode = res.errCode;
                        if (errCode === 12006) {
                            Utils.showTips('提示', '请打开GPS定位', false);
                            this.setData({
                                reStartInfo: '打开GPS定位'
                            });
                        } else if (errCode === 12005) {
                            Utils.showTips('提示', '请打开WiFi', false);
                            this.setData({
                                reStartInfo: '打开WIFI'
                            });
                        } else {
                            Utils.showTips('提示', `获取WiFi列表出错：${errCode}`, false);
                            this.setData({
                                reStartInfo: '再次获取WIFI列表'
                            });
                        }

                        this.setData({
                            showRestartModal: true
                        });
                    }
                })
            },
            fail: (res) => {
                Utils.showTips('', '初始化WIFI失败', false);
            }
        })
    },
    // /**
    //  * 初始化WIFI
    //  */
    // collcetWifi() {
    //     wx.startWifi({
    //         success: (res) => {
    //             this.getWifiList();
    //         },
    //         fail: (res) => {
    //             Utils.showTips('', '初始化WIFI失败', false);
    //         }
    //     })
    // },
    /**
     * 获取WIFI列表
     */
    getWifiList() {
        wx.getWifiList({
            success: res => {
                this.onGetWifiList();
                this.setData({
                    showCollectModal: true
                });
            }
        })
    },
    /**
     * 监听获取到的 wifi 列表数据
     */
    onGetWifiList() {
        wx.onGetWifiList(res => {
            this.setData({
                wifiList:res.wifiList
            });

            // this.wifiLoopObtain();
            console.log('wifiList:',this.data.wifiList);
        })
    },

    /**
     * 重新开始采集
     */
    restartCollection() {
        this.setData({
            showRestartModal: false
        });

        // this.collcetWifi();
        this.moduleStart();
    },

    /**
     * 保存采集过的WIFI数据
     * {
     * name:名字
     * time:时间戳
     * data:当前时间的WIFI列表
     * }
     */
    saveWifi() {
        let time = (new Date()).getTime();

        let momentData = {
            time: time,
            data: this.data.wifiList
        };

        this.data.infoList.push({
            name: this.data.inputInfo,
            list:momentData
        });
    },

    /**
     * 循环获取WIFI列表
     */
    wifiLoopObtain(){
        this.setData({
            collectTimer:setTimeout(()=>{
                this.getWifiList();
            },collectTime)
        });
    },
    /**
     * 采集完毕，开始下一地点采集
     */
    collectNext() {

        // 保存数据
        this.saveWifi();

        // 初始化状态
        this.setData({
            showCollectModal: false,
            active:-1,
            isCollecting:true,
            showMarkIcon: true
        })
    },
    /**
     * 结束采集
     */
    endCollect() {
        this.saveWifi();

        wx.setStorage({
            key: 'info',
            data: this.data.infoList,
        })
        this.setData({
            showCollectModal: false,
        });

        wx.navigateTo({
            url: '../info/info',
        })
    },
    /**
     * 改变采集进度状态
     */
    changeActive() {

        let time = Interval / this.data.collectTexts.length * 1000;

        let setIntervals = setInterval(() => {

            this.setData({
                isCollecting:true,
                active: this.data.active + 1
            });

            console.log(this.data.active);
            console.log(this.data.isCollecting);
            if (this.data.active >= this.data.collectTexts.length - 1) {
                clearInterval(setIntervals);
                this.setData({
                    isCollecting:false
                });

            }
        }, time);
    },


})