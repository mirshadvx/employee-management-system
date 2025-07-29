from django.urls import path
from .views import *

urlpatterns = [
    path('departments/', DepartmentView.as_view(), name='department-list'),
    path('departments/<int:id>/', DepartmentView.as_view(), name='department-detail'),
    path('form-creation/', DynamicFieldCreation.as_view(), name='form-creation'),
    path('form-update/<int:id>/', DynamicFieldUpdate.as_view(), name='form-update'),
    path('form-structure/<int:id>/', DepartmentFormStructure.as_view(), name='form-structure'),
    path('employees-create/', EmployeeCreateView.as_view(), name='employee-create'),
    path('employees/<int:id>/', EmployeeListView.as_view(), name='employee-list'),
    path('employees/detail/<int:employee_id>/', EmployeeDetailView.as_view(), name='employee-detail')
]
