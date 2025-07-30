from rest_framework import serializers
from .models import Department, DynamicField, Employee, EmployeeFieldData

class DepartmentSerializer(serializers.ModelSerializer):
    total_employees = serializers.SerializerMethodField()
    class Meta:
        model = Department
        fields = ['id', 'name', 'label', 'created_by', 'created_at', 'updated_at', 'total_employees']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'total_employees']
        
    def get_total_employees(self, obj):
        return Employee.objects.filter(department=obj).count()

class DynamicFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicField
        fields = ['id', 'department', 'label', 'field_type', 'field_options', 'order']

class DepartmentFieldSerializer(serializers.ModelSerializer):
    fields = DynamicFieldSerializer(many=True)

    class Meta:
        model = Department
        fields = ['id', 'fields']
        
class DepartmentFormSerializer(serializers.ModelSerializer):
    fields = DynamicFieldSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'fields']

class FormStructureSerializer(serializers.ModelSerializer):
    fields = DynamicFieldSerializer(many=True, read_only=True)
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'label', 'fields']
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return {
            'department_id': representation['id'],
            'department_name': representation['name'],
            'department_label': representation['label'],
            'fields': representation['fields']
        }

class EmployeeFieldDataSerializer(serializers.ModelSerializer):
    field = serializers.PrimaryKeyRelatedField(queryset=DynamicField.objects.all())

    class Meta:
        model = EmployeeFieldData
        fields = ['field', 'value']

    def validate(self, data):
        field = data['field']
        value = data['value']

        if field.field_type == 'number':
            try:
                float(value)
            except (ValueError, TypeError):
                raise serializers.ValidationError(f"Value for {field.label} must be a number.")
        elif field.field_type == 'email':
            if '@' not in str(value) or '.' not in str(value):
                raise serializers.ValidationError(f"Value for {field.label} must be a valid email.")
        elif field.field_type == 'boolean':
            if not isinstance(value, bool):
                raise serializers.ValidationError(f"Value for {field.label} must be a boolean.")
        elif field.field_type == 'select':
            choices = field.field_options.get('choices', []) if field.field_options else []
            if value not in choices:
                raise serializers.ValidationError(f"Value for {field.label} must be one of: {choices}")
        return data

class EmployeeCreateSerializer(serializers.ModelSerializer):
    field_data = EmployeeFieldDataSerializer(many=True)

    class Meta:
        model = Employee
        fields = ['department', 'field_data']

    def validate(self, data):
        department = data.get('department')
        field_data = data.get('field_data', [])
        
        department_fields = DynamicField.objects.filter(department=department)
        required_fields = set(department_fields.values_list('id', flat=True))
        provided_fields = set(fd['field'].id for fd in field_data)
        
        missing_fields = required_fields - provided_fields
        if missing_fields:
            missing_labels = DynamicField.objects.filter(id__in=missing_fields).values_list('label', flat=True)
            raise serializers.ValidationError(f"Missing required fields: {', '.join(missing_labels)}")
        
        return data

    def create(self, validated_data):
        field_data = validated_data.pop('field_data')
        employee = Employee.objects.create(**validated_data)
        
        for data in field_data:
            field = data['field']
            value = data['value']
            EmployeeFieldData.objects.create(employee=employee, field=field, value=value)
        
        return employee
    
    def update(self, instance, validated_data):
        field_data = validated_data.pop('field_data', [])
        instance.department = validated_data.get('department', instance.department)
        instance.save()

        EmployeeFieldData.objects.filter(employee=instance).delete()
        
        for data in field_data:
            field = data['field']
            value = data['value']
            EmployeeFieldData.objects.create(employee=instance, field=field, value=value)
        
        return instance
    
class EmployeeSerializer(serializers.ModelSerializer):
    field_data = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['id', 'department', 'field_data', 'created_at']

    def get_field_data(self, obj):
        field_data = EmployeeFieldData.objects.filter(employee=obj)
        return {
            fd.field.label: {
                'value': fd.value,
                'field_type': fd.field.field_type,
                'field_id': fd.field.id
            } for fd in field_data }
        
class DepartmentsNoFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'label']