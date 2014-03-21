$(document).ready(function(){
    //添加管理菜单部分

    var menus = $('.info-list').not('.info-list-reply').find('.info-list-text');
    menus.each(function(){
        menuGroup.setMenu($(this));
    });
});

var menuGroup = {};

menuGroup.list = [
    {
        name: '增加/编辑评论',
        fun: function(){
            var commentBox = $('<div class="info-list info-list-reply"></div>')
                .append($('<div class="info-list-head">评论师</div>'));
            var commentEditor = $('<div class="info-list-comment"></div>').attr('contenteditable', true).css({'margin': '5px 110px 5px 0'});
            var commentText = $('<div class="info-list-text"></div>')
                .append(commentEditor);
            var commentBtn = $('<input type="button" class="btn btn-sm btn-success pull-right" value="保存"/>');
            var cancelBtn = $('<input type="button" class="btn btn-sm btn-danger pull-right" value="取消"/>').css('marginLeft', 5);

            var isExistObj = $(this).closest('.info-list').next();
            if(isExistObj.find('.info-list-comment').html() != undefined){
                isExistObj.find('.info-list-comment').focus();
                return;
            }

            commentBtn.click(function(){
                var btn = $(this);
                var obj = btn.closest('.info-list-reply').prev().attr('data-handle');
                var tempText = $.trim(btn.next().html());
                btn.val('提交中').attr('disabled', 'disabled');
                cancelBtn.attr('disabled', 'disabled');
                $.post('/comments/', {content_object: obj, text: tempText})
                    .success(function(){
                        if(tempText == ''){
                            showMessage('删除评论成功！');
                            btn.closest('.info-list-reply').remove();
                        }else{
                            showMessage('添加评论成功！');
                            var textBox = btn.closest('.info-list-text');
                            var text = btn.next().html();
                            textBox.empty().html(text);
                        }
                    })
                    .error(function(){
                        showMessage('添加评论失败！');
                        btn.val('评论').removeAttr('disabled');
                        cancelBtn.removeAttr('disabled');
                    });
            });

            if(isExistObj.attr('class').indexOf('info-list-reply') == -1){
                commentBox.append(commentText.prepend(commentBtn).prepend(cancelBtn));
                cancelBtn.click(function(){
                    $(this).closest('.info-list-reply').remove();
                });
                $(this).closest('.info-list').after(commentBox);
                commentEditor.focus();
            }
            else{
                var tempText = isExistObj.find('.info-list-text').html();
                cancelBtn.click(function(){
                    var textBox = $(this).closest('.info-list-text');
                    textBox.empty().html(tempText);
                });
                isExistObj.find('.info-list-text').empty().append(cancelBtn)
                    .append(commentBtn).append(commentEditor.html(tempText));
                commentEditor.focus();
            }
        }
    },
    {
        name: '重要标记开关',
        fun: function(){
            showMessage('设置中...');
            var box = $(this).closest('.info-list');
            var id = $(this).closest('.info-list').attr('data-handle');
            var nowFlag = box.attr('class').indexOf('info-list-warning') != -1;
            $.ajax({
                url: '/infos/' + id + '/',
                type: 'PUT',
                data: {'is_breaking_news': nowFlag?0: 1},
                dataType: 'json',
                success: function() {
                    showMessage('设置成功！');
                    if(nowFlag){
                        box.removeClass('info-list-warning');
                    }else{
                        box.addClass('info-list-warning');
                    }
                },
                error: function(){
                    showMessage('设置失败！');
                }
            });
        }
    },
    {
        name: '隐藏此资讯',
        fun: function(){
            showMessage('设置中...');
            var id = $(this).closest('.info-list').attr('data-handle');
            var box = $(this).closest('.info-list');
            var reply = box.next();
            reply = reply.attr('class').indexOf('info-list-reply') != -1?reply: null;
            $.ajax({
                url: '/infos/' + id + '/',
                type: 'PUT',
                data: {'is_hidden': 1},
                dataType: 'json',
                success: function() {
                    showMessage('设置成功！');
                    box.slideUp(function(){
                        box.remove();
                    });
                    if(reply)
                        reply.slideUp(function(){
                            reply.remove();
                        });
                },
                error: function(){
                    showMessage('设置失败！');
                }
            });
        }
    }
];
menuGroup.setMenu = function(obj){
    var menuBox = $('<div class="info-list-menu dropdown"><a href="javascript:;" data-toggle="dropdown"><i class="icon-ellipsis-horizontal"></i></a></div>');
    var menuList = $('<ul class="dropdown-menu dropdown-menu-right"></ul>');

    for(var i=0;i<this.list.length;i++){
        var link = $('<a href="javascript:;">' + this.list[i].name +'</a>');
        var temp = $('<li></li>').append(link);
        link.click(this.list[i].fun);
        menuList.append(temp);
    }

    menuBox.append(menuList);
    obj.prepend(menuBox);
};
