from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def home_view(request, *args, **kwargs): 
    print(args, kwargs)
    print(request.user)
    #return HttpResponse("<h1>Hello World</h1>") # string of HTML code
    return render(request, "home.html", {})

def contact_view(request, *args, **kwargs): 
    return render(request, "contact.html", {})

def about_view(request, *args, **kwargs):
    return render(request, "about.html", {})


def login_view(request, *args, **kwargs):
    return render(request, "login.html", {})

def signup_view(request, *args, **kwargs):
    return render(request, "signup.html", {})

def forgottenpassword_view(request, *args, **kwargs):
    return render(request, "forgottenpassword.html", {})