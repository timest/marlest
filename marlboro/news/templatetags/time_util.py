from django import template

register = template.Library()

@register.filter(name='hour')
def get_hour(value):
    time = value.split(' ')[1]
    return time.split(':')[0]

@register.filter(name='minute')
def get_minute(value):
    time = value.split(' ')[1]
    return time.split(':')[1]
