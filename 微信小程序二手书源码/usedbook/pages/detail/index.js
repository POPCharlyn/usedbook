var app = getApp(), Toptips = require("../../libs/zanui/toptips/index"), Toast = require("../../libs/zanui/toast/toast");

Page({
    data: {
        noticeDots: !1,
        vertical: !0,
        autoplay: !0,
        interval: 3e3,
        duration: 500,
        videoCache: !0,
        showOrder: !1,
        showPopup: !1,
        reprot: !1,
        confirmBar: !1,
        disabled: !1,
        blacklist: !1,
        cancelWithMask: !0,
        
        cancelText: "取消",
        tips: {
            top: "您需要登录之后才能进行下一步操作",
            bottom: "点击确定按钮登录"
        },
        defaultBtn: !1
    },
    onLoad: function(t) {
        var a = this, e = wx.getStorageSync("loading_img"), s = wx.getStorageSync("post_open");
        if (e && a.setData({
            loadingImg: e
        }), s) {
            var o = wx.getStorageSync("post_btn_data");
            a.setData({
                showPostBtn: !0,
                post_appid: o.appid,
                post_url: o.url,
                post_img: o.thumb
            });
        }
       
        var i = t.id;
        t.share && a.setData({
            showShare: !0
        });
        var n = t.orderid, r = wx.getStorageSync("userInfo");
        if (r) {
            var d = r.memberInfo.uid;
            a.setData({
                uid: d,
                item_id: i
            });
        } else a.setData({
            item_id: i
        });
        t.myOrder && a.setData({
            showOrder: !0
        }), a.checkPlugin(), a.getItemDetail(i, n);
    },
    closeMask: function() {
        this.setData({
            showShare: !1
        });
    },
    checkPlugin: function() {
        var e = this;
        app.util.request({
            url: "entry/wxapp/home",
            cachetime: "0",
            data: {
                act: "plugin",
                m: "superman_hand2"
            },
            success: function(t) {
                if (t.data.errno) e.showIconToast(t.data.errmsg); else {
                    var a = t.data.data;
                    e.setData({
                        wechat_on: 1 == a.superman_hand2_plugin_wechat,
                        canSetTop: 1 == a.superman_hand2_plugin_ad
                    });
                }
            },
            fail: function(t) {
                e.showIconToast(t.data.errmsg);
            }
        });
    },
    getItemDetail: function(t) {
        var a = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 0, l = this;
        app.util.request({
            url: "entry/wxapp/item",
            cachetime: "0",
            data: {
                act: "detail",
                id: t,
                orderid: a,
                m: "superman_hand2"
            },
            success: function(t) {
                if (t.data.errno) l.showIconToast(t.data.errmsg); else {
                    var a = t.data.data;
                    if (l.data.uid && l.data.uid == a.item.seller_uid && l.setData({
                        is_author: !0
                    }), 0 < a.item.is_favour && l.setData({
                        is_fav: !0
                    }), 0 < a.item.is_collect && l.setData({
                        is_collect: !0
                    }), -1 == a.item.status && l.setData({
                        soldOut: !0
                    }), 2 == a.item.status && l.setData({
                        disabled: !0
                    }), !a.item.summary && 0 < a.item.book_fields.length) {
                        var e = a.item.book_fields, s = e.subtitle ? "-" + e.subtitle : "", o = e.author ? " ，作者：" + e.author : "", i = e.publisher ? "，" + e.publisher + e.pubdate + "出版" : "", n = e.pages ? " ，共" + e.pages + "页" : "", r = e.rating ? " ，豆瓣评分：" + e.rating : "", d = e.price ? " ，原价：" + e.price : "";
                        a.item.summary = a.item.title + s + o + i + n + r + d;
                    }
                    if (a.item.add_fields) {
                        for (var c = a.item.add_fields, u = 0; u < c.length; u++) "" == c[u].value && c.splice(u, 1);
                        a.item.add_fields = c;
                    }
                    l.setData({
                        detail: a.item,
                        message: a.message,
                        notice: a.notice,
                        notice_type: a.notice_type,
                        set_top: 1 == a.set_top,
                        completed: !0
                    });
                }
            },
            fail: function(t) {
                l.setData({
                    completed: !0
                }), l.showIconToast(t.data.errmsg);
            }
        });
    },
    getUserInfo: function(t) {
        var e = this;
        e.setData({
            showLogin: !1
        }), "getUserInfo:ok" == t.detail.errMsg && app.util.getUserInfo(function(t) {
            var a = t.memberInfo.uid;
            e.setData({
                uid: a
            }), e.data.liuyan && (e.setData({
                liuyan: !1
            }), e.leaveMsg()), e.data.huifu && (e.setData({
                huifu: !1
            }), e.replyMsg()), e.data.action && (e.setData({
                action: !1
            }), e.getItemDetail(e.data.item_id), e.itemAction()), e.data.action && (e.setData({
                action: !1
            }), e.itemAction()), e.data.chat && (e.setData({
                chat: !1
            }), e.getItemDetail(e.data.item_id), e.toChat());
        }, t.detail);
    },
    closeLogin: function() {
        this.setData({
            showLogin: !1
        });
    },
    previewImg: function(t) {
        var a = t.currentTarget.dataset.src;
        wx.previewImage({
            current: a,
            urls: this.data.detail.album
        });
    },
    showPosition: function(t) {
        var a = parseFloat(t.currentTarget.dataset.lat), e = parseFloat(t.currentTarget.dataset.lng);
        wx.openLocation({
            latitude: a,
            longitude: e,
            scale: 24
        });
    },
    showVideo: function(t) {
        var a = t.currentTarget.dataset.index, e = this.data.detail.video;
        this.setData({
            showPopup: !0,
            auto: !0,
            video: e[a]
        });
    },
    togglePopup: function() {
        this.setData({
            showPopup: !this.data.showPopup
        });
    },
    makeCall: function() {
        wx.makePhoneCall({
            phoneNumber: this.data.detail.order.mobile
        });
    },
    
    
    
    leaveMsg: function(t) {
        this.data.uid ? this.setData({
            showModal: !0
        }) : this.setData({
            showLogin: !0,
            liuyan: !0
        });
    },
    replyMsg: function(t) {
        var a = t.currentTarget.dataset.id;
        this.data.uid ? this.setData({
            msg_id: a,
            showModal: !0
        }) : this.setData({
            showLogin: !0,
            huifu: !0
        });
    },
    itemAction: function(t) {
        var e = this, s = t.currentTarget.dataset.type, o = t.currentTarget.dataset.status, i = e.data.item_id, a = t.detail.formId;
        e.data.uid ? (app.util.request({
            url: "entry/wxapp/notice",
            cachetime: "0",
            data: {
                act: "formid",
                formid: a,
                m: "superman_hand2"
            },
            success: function(t) {
                0 == t.data.errno ? console.log("formid已添加") : console.log(t.data.errmsg);
            },
            fail: function(t) {
                console.log(t.data.errmsg);
            }
        }), app.util.request({
            url: "entry/wxapp/item",
            cachetime: "0",
            data: {
                act: "detail",
                id: i,
                type: s,
                status: o,
                m: "superman_hand2"
            },
            success: function(t) {
                if (t.data.errno) e.showIconToast(t.data.errmsg); else {
                    var a = "";
                    1 == s ? o ? (a = "取消点赞", e.setData({
                        is_fav: !1
                    })) : a = "点赞成功" : o ? (a = "取消收藏", e.setData({
                        is_collect: !1
                    })) : a = "收藏成功", e.showIconToast(a, "success"), e.getItemDetail(i);
                }
            }
        })) : e.setData({
            showLogin: !0,
            action: !0
        });
    },
    
    closeModal: function() {
        this.setData({
            showModal: !1,
            report: !1
        });
    },
    formSubmit: function(t) {
        var a = this, e = t.detail.value.content, s = a.data.item_id, o = t.detail.formId;
        if ("" != e) if (app.util.request({
            url: "entry/wxapp/notice",
            cachetime: "0",
            data: {
                act: "formid",
                formid: o,
                m: "superman_hand2"
            },
            success: function(t) {
                0 == t.data.errno ? console.log("formid已添加") : console.log(t.data.errmsg);
            },
            fail: function(t) {
                console.log(t.data.errmsg);
            }
        }), a.data.report) app.util.request({
            url: "entry/wxapp/item",
            cachetime: "0",
            data: {
                act: "report",
                itemid: s,
                content: e,
                formid: o,
                m: "superman_hand2"
            },
            
        }); else if (a.data.msg_id) {
            var i = a.data.msg_id;
            app.util.request({
                url: "entry/wxapp/item",
                cachetime: "0",
                data: {
                    act: "detail",
                    id: s,
                    msg_id: i,
                    reply: e,
                    m: "superman_hand2"
                },
                success: function(t) {
                    a.setData({
                        showModal: !1
                    }), t.data.errno ? a.showIconToast(t.data.errmsg) : (a.showIconToast("回复成功", "success"), 
                    a.getItemDetail(s));
                }
            });
        } else app.util.request({
            url: "entry/wxapp/item",
            cachetime: "0",
            data: {
                act: "detail",
                id: s,
                comment: e,
                m: "superman_hand2"
            },
            success: function(t) {
                a.setData({
                    showModal: !1
                }), t.data.errno ? a.showIconToast(t.data.errmsg) : (a.showIconToast("提交成功", "success"), 
                a.getItemDetail(s));
            }
        }); else Toptips("内容不能为空");
    },
    toChat: function(t) {
        var a = this;
        if (a.data.uid) {
            var e = t.detail.formId;
            if (app.util.request({
                url: "entry/wxapp/notice",
                cachetime: "0",
                data: {
                    act: "formid",
                    formid: e,
                    m: "superman_hand2"
                },
                success: function(t) {
                    0 == t.data.errno ? console.log("formid已添加") : console.log(t.data.errmsg);
                },
                fail: function(t) {
                    console.log(t.data.errmsg);
                }
            }), a.data.uid == a.data.detail.seller_uid) a.data.disabled || a.openActionSheet(); else {
                var s = a.data.uid, o = a.data.detail.seller_uid;
                app.util.request({
                    url: "entry/wxapp/item",
                    cachetime: "0",
                    data: {
                        act: "detail",
                        chat: 1,
                        id: a.data.item_id,
                        from_uid: s,
                        m: "superman_hand2"
                    },
                    success: function(t) {
                        t.data.errno ? a.showIconToast(t.errmsg) : wx.navigateTo({
                            url: "../chat/index?fromuid=" + o + "&itemid=" + a.data.item_id
                        });
                    }
                });
            }
        } else a.setData({
            showLogin: !0,
            chat: !0
        });
    },
    openActionSheet: function() {
        this.setData({
            show: !0
        });
    },
    closeActionSheet: function() {
        this.setData({
            show: !1
        });
    },
    
    goNext: function() {
        var a = this, e = a.data.item_id, s = a.data.status;
        app.util.request({
            url: "entry/wxapp/item",
            cachetime: "0",
            data: {
                act: "detail",
                id: e,
                status: s,
                m: "superman_hand2"
            },
            success: function(t) {
                t.data.errno ? a.showIconToast(t.data.errmsg) : (a.showIconToast("操作成功", "success"), 
                a.setData({
                    show: !1,
                    defaultBtn: !1,
                    showLogin: !1
                }), a.getItemDetail(e), 2 == s && a.setData({
                    disabled: !0
                }));
            },
            fail: function(t) {
                a.setData({
                    showLogin: !1
                }), wx.showModal({
                    title: "系统提示",
                    content: t.data.errmsg + "(" + t.data.errno + ")"
                });
            }
        });
    },
    buy: function(t) {
        var a = t.detail.formId;
        app.util.request({
            url: "entry/wxapp/notice",
            cachetime: "0",
            data: {
                act: "formid",
                formid: a,
                m: "superman_hand2"
            },
            success: function(t) {
                0 == t.data.errno ? console.log("formid已添加") : console.log(t.data.errmsg);
            },
            fail: function(t) {
                console.log(t.data.errmsg);
            }
        });
        var e = t.currentTarget.dataset.id, s = t.currentTarget.dataset.type;
        wx.navigateTo({
            url: "../cashier/index?type=" + s + "&id=" + e
        });
    },
    onShareAppMessage: function(t) {
        return {
            title: this.data.detail.title,
            path: "/pages/detail/index?id=" + this.data.item_id
        };
    },
    showIconToast: function(t) {
        var a = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "fail";
        Toast({
            type: a,
            message: t,
            selector: "#zan-toast"
        });
    }
});