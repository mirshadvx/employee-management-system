from django.urls import path
from .views import *

urlpatterns = [
    path('departments/', DepartmentView.as_view(), name='department-list'),
    path('departments/<int:id>/', DepartmentView.as_view(), name='department-detail'),
]
