import django_filters
from .models import Department

class DepartmentFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    label = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Department
        fields = ['name', 'label']