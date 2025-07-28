from django.urls import path
from .views import *

urlpatterns = [
    path('departments/', DepartmentView.as_view(), name='department-list'),
    path('departments/<int:id>/', DepartmentView.as_view(), name='department-detail'),
    path('form-creation/', DynamicFieldCreation.as_view(), name='form-creation'),
    path('form-structure/<int:id>/', DepartmentFormStructure.as_view(), name='form-structure'),
]
