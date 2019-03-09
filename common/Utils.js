/**
 * 封装 wx.showModal
 */
const showTips = function (title, content, showCancel, callback) {
    let success;
    if (callback) {
        success = (res) => {
            callback(res);
        }
    } else {
        success = () => { };
    }
    wx.showModal({
        title,
        content,
        showCancel,
        success
    });
};


module.exports = {
    showTips
}