from django import forms
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import User

# from .models import CustomUser

class RegisterForm(UserCreationForm):
	email = forms.EmailField()

	class Meta:
		model = User
		fields = ["username", 
                  "email", 
                  "password1", 
                  "password2"]


# class CustomUserChangeForm(UserChangeForm):

#     class Meta:
#         model = CustomUser
#         fields = ('username', 'email')