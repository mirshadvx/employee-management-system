from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('Admin/', admin.site.urls),
    path('api/v1/auth/', include('authCustom.urls')),
    path('api/v1/', include('employee.urls')),
    #templates include apps
    path('', include('home.urls')),
    path('', include('dashboard.urls')),
]
