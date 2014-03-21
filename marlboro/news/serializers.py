#-*- coding:utf-8 -*-
from rest_framework import serializers
from models import Info, Comment

class InfoSerializers(serializers.ModelSerializer):
    class Meta:
        model = Info

class CommentSerializers(serializers.ModelSerializer):
    class Meta:
        model = Comment
