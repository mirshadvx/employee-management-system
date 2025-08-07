from django import template

register = template.Library()

@register.filter
def lookup(value, key):
    if isinstance(value, dict):
        return value.get(key, '')
    elif isinstance(value, list):
        for item in value:
            if isinstance(item, dict) and item.get('label') == key:
                return item.get('value', '')
    return ''