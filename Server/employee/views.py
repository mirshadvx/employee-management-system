from rest_framework.views import APIView
from .models import Department, Employee, DynamicField
from .serializers import (DepartmentSerializer, DynamicFieldSerializer, DepartmentFormSerializer,
                          EmployeeCreateSerializer, EmployeeSerializer)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .filters import DepartmentFilter
from django.shortcuts import get_object_or_404

class DepartmentView(APIView):

    def get(self, request, id=None):
        try:
            if id:
                department = get_object_or_404(Department, id=id, created_by=request.user)
                serializer = DepartmentSerializer(department)
                return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
            else:
                queryset = Department.objects.filter(created_by=request.user)
                try:
                    filterset = DepartmentFilter(request.query_params, queryset=queryset)
                    if filterset.is_valid():
                        queryset = filterset.qs
                except NameError:
                    pass
                serializer = DepartmentSerializer(queryset, many=True)
                return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except Department.DoesNotExist:
            return Response({'success': False, 'message': 'department not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'message': 'error retrieving departments', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = DepartmentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(created_by=request.user)
                return Response({'success': True, 'message': 'department created', 'data': serializer.data}, status=status.HTTP_201_CREATED)
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success': False, 'message': 'error creating department', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, id):
        try:
            department = Department.objects.get(id=id)
            serializer = DepartmentSerializer(department, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({'success': True, 'message': 'department updated', 'data': serializer.data}, status=status.HTTP_200_OK)
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Department.DoesNotExist:
            return Response({'success': False, 'message': 'department not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'message': 'department update failed', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, id):
        try:
            department = Department.objects.get(id=id)
            department.delete()
            return Response({'success': True, 'message': 'department deleted'}, status=status.HTTP_200_OK)
        except Department.DoesNotExist:
            return Response({'success': False, 'message': 'department not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'message': 'department deletion failed', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class DynamicFieldCreation(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            department_id = request.data.get('department')
            fields_data = request.data.get('fields',[])
            department = Department.objects.get(id=department_id)
            print(request.data)
            for field_data in fields_data:
                field_data['department'] = department.id
                serializer = DynamicFieldSerializer(data=field_data)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response({"success": False, "message": "form creation faild"}, status=status.HTTP_400_BAD_REQUEST)
            return Response(
                {"success": True, "message": "Form created successfully"}, status=status.HTTP_201_CREATED )
                    
        except Department.DoesNotExist:
            return Response({"error": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'message': 'form creation faild', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class DepartmentFormStructure(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, id):
        try:
            department = get_object_or_404(Department, id=id)
            serializer = DepartmentFormSerializer(department)
            return Response({
            'department_id': department.id,
            'department_name': department.name,
            'department_label': department.label,
            "fields": serializer.data['fields']}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'success': False, 'message': "error retrieving department form structure",
                             'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
class EmployeeCreateView(APIView):
    def post(self, request):
        serializer = EmployeeCreateSerializer(data=request.data)
        if serializer.is_valid():
            employee = serializer.save()
            return Response({ 'success': True,
                'data': {
                    'id': employee.id,
                    'department': employee.department.id,
                    'created_at': employee.created_at }}, status=status.HTTP_201_CREATED)
        return Response({ 'success': False, 'errors': serializer.errors }, status=status.HTTP_400_BAD_REQUEST)
        
class EmployeeListView(APIView):
    def get(self, request, id):
        if not id:
            return Response({ 'success': False,
                'error': 'Department ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            department = get_object_or_404(Department, id=id)
            employees = Employee.objects.filter(department=department)
            serializer = EmployeeSerializer(employees, many=True)
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({ 'success': False,
                'error': 'Invalid department ID' }, status=status.HTTP_400_BAD_REQUEST)
            
class EmployeeDetailView(APIView):
    def get(self, request, employee_id):
        employee = get_object_or_404(Employee, id=employee_id)
        serializer = EmployeeSerializer(employee)
        return Response({ 'success': True,
            'data': serializer.data }, status=status.HTTP_200_OK)

    def put(self, request, employee_id):
        employee = get_object_or_404(Employee, id=employee_id)
        serializer = EmployeeCreateSerializer(employee, data=request.data)
        if serializer.is_valid():
            employee = serializer.save()
            return Response({
                'success': True,
                'data': {
                    'id': employee.id,
                    'department': employee.department.id,
                    'created_at': employee.created_at}}, status=status.HTTP_200_OK)
        return Response({'success': False,
            'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, employee_id):
        employee = get_object_or_404(Employee, id=employee_id)
        try:
            employee.delete()
            return Response({'success': True,
                'message': 'Employee deleted successfully' }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({ 'success': False,
                'error': f'Failed to delete employee: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

class DynamicFieldUpdate(APIView):

    def put(self, request, id):
        try:
            department = Department.objects.get(id=id)
            
            existing_field_ids = set(DynamicField.objects.filter(department_id=id).values_list('id', flat=True))
            submitted_field_ids = set(field_data.get('id') for field_data in request.data.get('fields', []) if field_data.get('id'))
            
            fields_to_delete = existing_field_ids - submitted_field_ids
            DynamicField.objects.filter(id__in=fields_to_delete).delete()

            for field_data in request.data.get('fields', []):
                field_data['department'] = id
                field_id = field_data.get('id')
                
                if field_id and DynamicField.objects.filter(id=field_id, department_id=id).exists():
                    field = DynamicField.objects.get(id=field_id, department_id=id)
                    serializer = DynamicFieldSerializer(field, data=field_data, partial=True)
                else:
                    if 'id' in field_data:
                        del field_data['id']
                    serializer = DynamicFieldSerializer(data=field_data)

                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response({"success": False, "message": "Form update failed", "errors": serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST)

            return Response( {"success": True, "message": "Form updated successfully"},
                status=status.HTTP_200_OK )

        except Department.DoesNotExist:
            return Response({"success": False, "message": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"success": False, "message": "Form update failed", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR )