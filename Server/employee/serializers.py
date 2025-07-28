from rest_framework import serializers
from .models import Department, DynamicField

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'label', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

class DynamicFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicField
        fields = ['id', 'department', 'label', 'field_type', 'field_options', 'order']

class DepartmentFieldSerializer(serializers.ModelSerializer):
    fields = DynamicFieldSerializer(many=True)

    class Meta:
        model = Department
        fields = ['id', 'fields']