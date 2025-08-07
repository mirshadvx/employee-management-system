from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views import View
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import  check_password
from django.contrib import messages
from django.contrib.auth import update_session_auth_hash
import json

User = get_user_model()

class HomeView(View):
    def get(self, request):
        return render(request, 'home.html')

class SignInView(View):
    def get(self, request):
        return render(request, 'signin.html')

class SignUpView(View):
    def get(self, request):
        return render(request, 'signup.html')

class DashboardView(View):
    @method_decorator(login_required)
    def get(self, request):
        return render(request, 'dashboard.html')

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'success': False, 'message': 'No active account found with this information'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    def post(self, request):
        try:
            logout(request)
            return JsonResponse({'success': True, 'message': 'Logged out successfully'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            password2 = data.get('password2')

            if User.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'username': 'Username already exists'}, status=400)
            if email and User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'email': 'Email already exists'}, status=400)
            if password != password2:
                return JsonResponse({'success': False, 'password2': 'Passwords do not match'}, status=400)
            if len(password) < 8 or not any(c.isupper() for c in password) or not any(c.islower() for c in password) or not any(c.isdigit() for c in password):
                return JsonResponse({
                    'success': False,
                    'password': 'Password must be at least 8 characters, with one uppercase letter, one lowercase letter, and one number'
                }, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            return JsonResponse({'success': True, 'message': 'Registered successfully'}, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=400)
        
        
@login_required
def ProfileView(request):
    if request.method == 'POST':
        old_password = request.POST.get('old_password')
        new_password1 = request.POST.get('new_password1')
        new_password2 = request.POST.get('new_password2')

        if not check_password(old_password, request.user.password):
            messages.error(request, 'Current password is incorrect!')
            return render(request, 'profile.html')

        if new_password1 != new_password2:
            messages.error(request, 'New passwords do not match!')
            return render(request, 'profile.html')

        if len(new_password1) < 8:
            messages.error(request, 'New password must be at least 8 characters long!')
            return render(request, 'profile.html')

        request.user.set_password(new_password1)
        request.user.save()
        update_session_auth_hash(request, request.user)
        messages.success(request, 'Your password was successfully updated!')
        return redirect('profile')

    return render(request, 'profile.html')