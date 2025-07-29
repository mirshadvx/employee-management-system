from django.db import models
from django.contrib.auth.models import AbstractUser

class Profile(AbstractUser):
    email = models.EmailField(unique=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    
    def __str__(self):
        return self.username