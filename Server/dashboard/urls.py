from django.urls import path
from .views import *

urlpatterns = [
    path('dashboard/', dashboard, name='dashboard'),
    path('dashboard/employees/', employee_details, name='employee_details'),
    path('dashboard/employees/create/', employee_create, name='employee_create'),
    path('dashboard/employees/<int:employee_id>/edit/', employee_edit, name='employee_edit'),
    path('dashboard/employee/delete/<int:employee_id>/', employee_delete, name='employee_delete'),
    path('dashboard/departments/', department_overview, name='department_overview'),
    path('dashboard/departments/create/', department_create, name='department_create'),
    path('dashboard/departments/<int:dept_id>/edit/', department_edit, name='department_edit'),
    path('dashboard/departments/<int:dept_id>/delete/', department_delete, name='department_delete'),
    path('dashboard/forms/create/', form_create, name='form_create'),
    path('dashboard/forms/edit/<int:department_id>/', form_edit, name='form_edit'),
]
