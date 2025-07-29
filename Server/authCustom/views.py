from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth import update_session_auth_hash
from .utils import upload_to_cloudinary

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data
            access_token = tokens['access']
            refresh_token = tokens['refresh']
            res = Response()
            
            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            
            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            res.data = {'success':True}
            return res
        except Exception as e:
            return Response({'success': False, 'message': 'No active account found this information'}, status=status.HTTP_400_BAD_REQUEST)
        
class CustomTokenRefreshToken(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if not refresh_token:
                return Response({'success': False, 'message': 'Refresh token not found in cookies'}, status=status.HTTP_400_BAD_REQUEST)
            
            request.data['refresh'] = refresh_token
            response = super().post(request, *args, **kwargs)
            tokens = response.data
            access_token = tokens['access']
            res = Response({'success': True})
            
            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            return res
        except Exception as e:
            return Response({'success': False , 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['POST'])
def logout(request):
    try:
        response = Response({'success':True, 'message': 'logout successfully'})
        response.delete_cookie('access_token', path='/', samesite='None')
        response.delete_cookie('refresh_token', path='/', samesite='None')
        return response
    except Exception as e:
        return Response({'success': False}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def is_authenticated(request):
    return Response({'success': True}, status=status.HTTP_200_OK) if request.user.is_authenticated else Response({'success': False}, status=status.HTTP_401_UNAUTHORIZED)

class Register(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Registered Successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        profile_picture_file = request.FILES.get('profile_picture')
        if profile_picture_file:
            try:
                profile_picture_url = upload_to_cloudinary(profile_picture_file)
                request.user.profile_picture = profile_picture_url
                request.user.save()
                return Response({'success': True, 'profile_picture': profile_picture_url}, status=status.HTTP_200_OK)
            except Exception as e:
                print(str(e))
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'success': False, 'message': 'image not found in request', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class ChangePasswordView(APIView):

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response({'success': False, 'message': 'Both current_password and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST )

        user = request.user
        if not user.check_password(current_password):
            return Response( {'success': False,'message': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST )
        
        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)

        return Response({'success': True, 'message': 'Password updated successfully.'}, status=status.HTTP_200_OK )


    