#-*- coding: utf-8 -*-
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from news.serializers import InfoSerializers, CommentSerializers
from news.models import Info, Comment

import datetime
import redis

POOL = redis.ConnectionPool(host='127.0.0.1', port=6379, db=0)

def home(request):
    tmp = Info.objects.filter(is_hidden=0)[:20]
    infos = []
    for i in tmp:
        try:
            i.comment = Comment.objects.get(content_object__pk=i.id)
            if not i.comment.text :
                i.comment = None
        except:
            i.comment = None

        infos.append(i)
    now = datetime.datetime.now()
    return render(request, 'index.html', locals())

@api_view(['POST',])
@permission_classes([IsAdminUser,])
def comment_list(request):
    if request.method == 'POST':
        data = request.DATA.copy()
        try:
            comment = Comment.objects.get(content_object__pk=data['content_object'])
            serializer = CommentSerializers(comment, data=data)
        except:
            comment = Comment(text=data['text'], content_object=Info.objects.get(id=data['content_object']) )
            serializer = CommentSerializers(data=data)

        if serializer.is_valid():
            serializer.save()
            r = redis.StrictRedis(connection_pool=POOL)
            r.publish('comments', '[{"id":"%s", "comment":"%s"}]' % (data['content_object'], data['text'].strip()) )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser, ])
def info_detail(request, pk):

    try:
        object = Info.objects.get(id=pk)
    except:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = InfoSerializers(object)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = InfoSerializers()
        serializer = serializer.restore_object(attrs=request.DATA, instance=object)

        serializer.save()
        try:
            c = Comment.objects.get(content_object__pk=serializer.id)
            comment_text = c.text
        except:
            comment_text = ''
        r = redis.StrictRedis(connection_pool=POOL)
        r.publish('infos', ' {"id":"%s", "is_hidden":"%s", "is_breaking_news":"%s" , "bullish_or_bearish":"%s", "comment_text":"%s" }' %
                            (serializer.id, serializer.is_hidden, serializer.is_breaking_news, serializer.bullish_or_bearish, comment_text ) )

        return Response('success', status=status.HTTP_201_CREATED)

    elif request.method == 'DELETE':
        object.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
