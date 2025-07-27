from django.db import models
from django.contrib.auth import  get_user_model

User = get_user_model()

class Department(models.Model):
    name = models.CharField(max_length=100)
    label = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='departments')

    def __str__(self):
        return f"{self.name} - {self.label}"
    
class DynamicField(models.Model):
    FIELD_TYPES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('email', 'Email'),
        ('password', 'Password'),
        ('boolean', '(True/False)'),
        ('select', 'Dropdown'),
        ('textarea', 'Multiline'),
        ('file', 'File Upload'),
    ]

    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='fields')
    label = models.CharField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    field_options = models.JSONField(blank=True, null=True, help_text="Used for select fields. Format: {\"choices\": [\"Option1\", \"Option2\"]}")
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.label} - {self.get_field_type_display()}"

class Employee(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='employees')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Employee #{self.id} - {self.department.name}"

class EmployeeFieldData(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='field_data')
    field = models.ForeignKey(DynamicField, on_delete=models.CASCADE)
    value = models.TextField()

    def __str__(self):
        return f"{self.field.label} - {self.value}"