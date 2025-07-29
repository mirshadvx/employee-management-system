import django_filters
from .models import Department, Employee, DynamicField, EmployeeFieldData
from django.db.models import Q

class DepartmentFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    label = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Department
        fields = ['name', 'label']

class EmployeeFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Employee
        fields = ['search']

    def filter_search(self, queryset, name, value):
        department_id = self.request.parser_context['kwargs'].get('id')
        if not department_id:
            return queryset.none()

        dynamic_fields = DynamicField.objects.filter(department_id=department_id)

        matching_employee_ids = set()
        for field in dynamic_fields:
            field_data_qs = EmployeeFieldData.objects.filter(field=field)
            for field_data in field_data_qs:
                if value.lower() in str(field_data.value).lower():
                    matching_employee_ids.add(field_data.employee_id)

        return queryset.filter(id__in=matching_employee_ids)

