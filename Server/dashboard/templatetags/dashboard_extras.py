from django import template
register = template.Library()

@register.filter
def get_item(dictionary, key):
    if dictionary is None:
        return None
    return dictionary.get(key, None)

@register.filter
def get_value(dictionary, key):
    return dictionary.get(str(key), "")



