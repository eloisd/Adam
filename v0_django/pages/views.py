from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.
def home_view(request, *args, **kwargs): 
    print(args, kwargs)
    print(request.user)
    #return HttpResponse("<h1>Hello World</h1>") # string of HTML code
    return render(request, "home.html", {})

def landing_page_view(request, *args, **kwargs): 
    print(args, kwargs)
    print(request.user)
    #return HttpResponse("<h1>Hello World</h1>") # string of HTML code
    return render(request, "landingpage.html", {})

def contact_view(request, *args, **kwargs): 
    my_context = {

    }
    return render(request, "contact.html", my_context)

def about_view(request, *args, **kwargs):
    my_context = {
        "title": "this is about us",
        "my_number": 123,
        "my_list": [123, 456, 789, "Abc"],
        "my_html": "<h1>Hello World</h1>",
    }
    return render(request, "about.html", my_context)