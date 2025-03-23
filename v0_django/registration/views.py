from django.shortcuts import render, redirect

from .forms import RegisterForm

# Create your views here.
def register(request, *args, **kwargs):
    template_name = "registration/signup.html"
    context = {}
    # if request.method == "POST":
    form = RegisterForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect("/login")
    else:
        form = RegisterForm()
    context["form"] = form
		
    return render(request, template_name, context)