# dashboard/templatetags/dict_filters.py
from django import template

register = template.Library()

# @register.filter
# def lookup(dictionary, key):
#     return dictionary.get(key)

@register.filter
def lookup(value, key):
    if isinstance(value, dict):
        return value.get(key, '')
    elif isinstance(value, list):
        for item in value:
            if isinstance(item, dict) and item.get('label') == key:
                return item.get('value', '')
    return ''

@register.filter
def json(value):
    import json
    return json.dumps(value)

@register.filter
def first(sequence):
    return sequence[0] if sequence else None

@register.filter
def get_item(dictionary, key):
    return dictionary.get(key, {}).get('value') if isinstance(dictionary, dict) else None