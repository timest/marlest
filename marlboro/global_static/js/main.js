$(document).ready(function(){

    //启用BootStrap组件
    $('.need-tooltip').tooltip({container: 'body'});

    //启用桌面通知部分
    desktopNotice.run($('#desktopSwitch'));

    //启用实时更新部分
    liveModule.run($('#liveSwitch'));

    //消除设置菜单的事件冒泡
    $('#info-setting-menu').click(function(e){
        e.stopPropagation();
    });

    //设置菜单的特效
    $('.info-title-btn').mousedown(function(){
        $(this).css({'color': '#f3f3f3', 'top': 1});
    });
    $('.info-title-btn').mouseup(function(){
        $(this).css({'color': '#ffffff', 'top': 0});
    });

});

//网站功能模块部分
var menuGroup = null;

//数据插入模块
var infoModule = {};
infoModule.insert = function(message){
    var infoBox = $('<div class="info-list"></div>');
    var infoHead = $('<div class="info-list-head"></div>');
    var infoText = $('<div class="info-list-text"></div>');
    var infoType = $('<span class="label pull-right"></span>');
    var messageDate = infoModule.dateTime(message.add_time).getDate();
    var messageTime = infoModule.dateTime(message.add_time).getTime();
    var latestDate = $('.info-list-time:first').find('span:eq(0)').html();
    var insertPlace = $('.info-list:first');

    if(infoModule.dateTime(null).compareDate(messageDate, latestDate)){
        insertPlace = $('.info-list-time:eq(0)');
        var timeBox = $('<div class="info-list-time"><i class="icon-calendar"></i> <span>'
            + messageDate + '</span></div>');
        insertPlace.before(timeBox);
    }

    infoBox.attr('data-handle', message.id);
    infoHead.html(messageTime);
    infoText.html(message.title);
    if(menuGroup)
        menuGroup.setMenu(infoText);
    infoBox.append(infoHead).append(infoText.append(infoType)).hide();
    insertPlace.before(infoBox);
    infoBox.slideDown();
    desktopNotice.show(messageTime + ' 中金网通知', message.title);
    voiceModule.play();
}
infoModule.search = function(id){
    var allInfo = $('.info-list').not('.info-list-reply');
    for(var i=0;i<allInfo.size();i++){
        if(allInfo.eq(i).attr('data-handle') == id)
            return allInfo.eq(i);
    }
    return false;
}
infoModule.delete = function(obj){
    var objNext = obj.next();
    objNext = objNext.attr('class').indexOf('info-list-reply') != -1?objNext: null;
    obj.remove();
    if(objNext)
        objNext.remove();
}
infoModule.comment = function(obj, comments){
    var objNext = obj.next();
    objNext = objNext.attr('class').indexOf('info-list-reply') != -1?objNext: null;
    if(objNext){
        objNext.find('.info-list-text').html(comments.comment);
    }else{
        var commentBox = $('<div class="info-list info-list-reply"></div>')
            .append($('<div class="info-list-head">评论师</div>'));
        var commentText = $('<div class="info-list-text"></div>')
        commentText.html(comments.comment);
        commentBox.append(commentText).hide();
        obj.after(commentBox);
        commentBox.slideDown();
    }
}
infoModule.update = function(obj, infos){
    if(infos.is_hidden == 1)
        infoModule.delete(obj);
    if(infos.is_breaking_news == 1){
        var head = obj.find('.info-list-head');
        obj.addClass('info-list-warning');
        head.addClass('need-tooltip')
            .attr({'data-toggle': 'tooltip', 'data-original-title': '重要资讯'});
        head.tooltip();
    }else{
        obj.removeClass('info-list-warning');
    }
    switch(parseInt(infos.bullish_or_bearish)){
        case 0:
            obj.find('.label').removeClass('info-type-more')
                .removeClass('info-type-less').addClass('info-type-null');
            break;
        case 1:
            obj.find('.label').removeClass('info-type-null')
                .removeClass('info-type-less').addClass('info-type-more');
            break;
        case 2:
            obj.find('.label').removeClass('info-type-null')
                .removeClass('info-type-more').addClass('info-type-less');
            break;
    }
}
infoModule.dateTime = function(str){
    return {
        getDate: function(){
            return str.split(' ')[0];
        },
        getTime: function(){
            var temp = str.split(' ')[1].split(':');
            return temp[0] + ':' + temp[1];
        },
        compareDate: function(date1, date2){
            var temp1 = date1.split('-');
            var temp2 = date2.split('-');
            if(temp1.length != temp2.length)
                return false;
            for(var i=0;i<temp1.length;i++)
                if(temp1[i]>temp2[i])
                    return true;
            return false;
        }
    }
}

//socket模块
var socketModule = {
    host: 'http://127.0.0.1',
    port: 4001,
    socket: null,
    create: function(){
        if(this.socket == null)
            this.socket = io.connect( this.host, {port: this.port });
    }
};

//实时更新模块
var liveModule = {
    power: true,
    obj: null,
    icon: null,
    existSocket: false
};
liveModule.switch = function(flag){
    this.power = flag;
    cookieModule.setLiveUpdate(flag);
    if(flag){
        showMessage('您已启用实时更新，如有新资讯将立即推送给您', 310);
        this.icon.addClass('icon-spin')
            .attr('data-original-title', '实时更新已启用');
    }
    else{
        showMessage('您已禁用实时更新，将不会收到新资讯推送', 280);
        this.icon.removeClass('icon-spin')
            .attr('data-original-title', '实时更新已禁用');
    }
}
liveModule.run = function(obj){
    this.obj = obj;
    this.icon = $('#iconLive');
    obj.click(function(){
        if(liveModule.existSocket == false && !liveModule.power)
            liveModule.setSocket();
        liveModule.switch(!liveModule.power);
        powerSwitch(obj);
    });
    if(cookieModule.getLiveUpdate() == 'false'){
        this.switch(false);
        obj.addClass('power-off');
        return;
    }
    this.setSocket();
}
liveModule.setSocket = function(){
    socketModule.create();
    liveModule.existSocket = true;
    socketModule.socket.on('infos', function(infos) {
        var infos = $.parseJSON(infos.replace("/'/g", '"'));
        var target = infos.id?infoModule.search(infos.id): null;
        if(target)
            infoModule.update(target, infos);
        else if(liveModule.power)
            infoModule.insert(infos);
    });
    socketModule.socket.on('comments', function(comments){
        var comments = $.parseJSON(comments.replace("/'/g", '"'));
        var target = null;
        for(var i=0;i<comments.length;i++){
            target = comments[i].id?infoModule.search(comments[i].id): null;
            if(target)
                infoModule.comment(target, comments[i]);
        }
    });
}

//桌面通知模块
var desktopNotice = {
    iconSrc: '',
    obj: null,
    icon: null,
    power: false
};

desktopNotice.request = function(){
    if(window.webkitNotifications){
        if(window.webkitNotifications.checkPermission() == 2){
            showMessage('您已阻止桌面通知，若要开启请到设置中修改', 300);
            this.switch(false);
            return false;
        }else if(window.webkitNotifications.checkPermission() == 0){
            if(this.power){
                showMessage('您已关闭桌面通知，将不再会收到提醒', 250);
                this.switch(false);
                return true;
            }else{
                showMessage('您已启用桌面通知，有资讯推送将会提示您', 280);
                this.switch(true);
                return true;
            }
        }else
            window.webkitNotifications.requestPermission(function(){
                if(this.request())
                    powerSwitch(this.obj);
            });
    }else{
        showMessage('您的浏览器不支持桌面通知，请下载Chrome浏览器后尝试', 400);
        this.switch(false);
        return false;
    }
}
desktopNotice.switch = function(flag){
    this.power = flag;
    cookieModule.setDesktopNotice(flag);
    if(flag)
        this.icon.removeClass('icon-bell').addClass('icon-bell-alt')
            .attr('data-original-title', '桌面通知已启用');
    else
        this.icon.removeClass('icon-bell-alt').addClass('icon-bell')
            .attr('data-original-title', '桌面通知已禁用');
}
desktopNotice.show = function(title, content){
    if(!this.power)
        return;
    var notification = webkitNotifications.createNotification( this.icon, title, content );
    notification.show();
    setTimeout(function(){
        notification.cancel();
    },3000)
}
desktopNotice.check = function(){
    if(window.webkitNotifications.checkPermission() == 0){
        if(cookieModule.getDesktopNotice() == 'true'){
            this.switch(true);
            this.obj.removeClass('power-off');
            showMessage('您已启用桌面通知，有资讯推送将会提示您', 280);
        }
    }
}
desktopNotice.run = function(obj){
    this.obj = obj;
    this.icon = $('#iconNotice');
    if(window.webkitNotifications)
        this.check();
    obj.click(function(){
        if(desktopNotice.request())
            powerSwitch(obj);
    });
}

//cookie存取模块
var cookieModule = {};
cookieModule.get = function (name) {
    var cookieName = encodeURIComponent(name) + "=",
        cookieStart = document.cookie.indexOf(cookieName),
        cookieValue = null;
    if (cookieStart > -1) {
        var cookieEnd = document.cookie.indexOf(";", cookieStart)
        if (cookieEnd == -1) {
            cookieEnd = document.cookie.length;
        }
        cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
    }
    return cookieValue;
}
cookieModule.set = function (name, value, expires) {
    var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    if (expires instanceof Date) {
        cookieText += "; expires=" + expires.toGMTString();
    }
    document.cookie = cookieText;
}
cookieModule.getDesktopNotice = function(){
    return this.get('desktopNotice');
}
cookieModule.setDesktopNotice = function(flag){
    this.set('desktopNotice', flag);
}
cookieModule.getVoiceNotice = function(){
    return this.get('voiceNotice');
}
cookieModule.setVoiceNotice = function(flag){
    this.set('voiceNotice', flag);
}
cookieModule.getLiveUpdate = function(){
    return this.get('liveUpdate');
}
cookieModule.setLiveUpdate = function(flag){
    this.set('liveUpdate', flag);
}

//全局开关切换效果函数
function powerSwitch(obj){
    var power = obj.find('.info-title-power:eq(0)');
    if(obj.attr('class') == undefined || obj.attr('class').indexOf('power-off') == -1)
        power.stop(true, true).animate({'marginLeft': 20}, 200, function(){
            obj.addClass('power-off');
        })
    else
        power.stop(true, true).animate({'marginLeft': 0}, 200, function(){
            obj.removeClass('power-off');
        })
}
//全局信息显示函数
function showMessage(str, width){
    var style = {
        position: 'fixed',
        left: '50%',
        marginLeft: -55,
        marginTop: -30,
        width: 110,
        padding: '3px 5px',
        color: '#ffffff',
        textAlign: 'center',
        borderRadius: 3,
        backgroundColor: '#000',
        opacity: 0
    }

    var box = $('<div class="js-message-tip"></div>').css(style);
    if(width){
        box.css({'width': width, 'marginLeft': -width/2});
    }
    box.html(str);
    var nowHeight = 30;
    var beforeMessage = $('.js-message-tip:last');
    if(beforeMessage.html() != undefined)                          {
        nowHeight = parseInt(beforeMessage.css('top')) + beforeMessage.height();
    }
    box.css('top', nowHeight + 10);
    $('body').append(box);
    box.animate({'marginTop': 0, 'opacity': 0.8}, 300);
    setTimeout(function(){
        box.animate({'marginTop': 10, 'opacity': 0}, function(){
            box.remove();
        });
    }, (1000 + $('.js-message-tip').size() * 1000));
}
