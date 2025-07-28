from rest_framework.views import APIView
from .models import Department
from .serializers import DepartmentSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .filters import DepartmentFilter

class DepartmentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, id=None):
        try:
            if id:
                department = Department.objects.get(id=id)
                serializer = DepartmentSerializer(department)
                return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
            else:
                filterSet = DepartmentFilter(request.query_params, queryset=Department.objects.all())
                if filterSet.is_valid():
                    department = filterSet.qs
                else:
                    department = Department.objects.all()
                departments = Department.objects.all()
                serializer = DepartmentSerializer(departments, many=True)
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