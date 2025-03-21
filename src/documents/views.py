from django.shortcuts import render

# Create your views here.
from .forms import DocumentForm
from .models import Document
# Create your views here.

def document_create_view(request):
    form = DocumentForm(request.POST or None)
    if form.is_valid():
        form.save()
        form = DocumentForm()
        
    context = {
        'form': form
    }
    return render(request, "documents/document_create.html", context)

def document_detail_view(request):
    obj = Document.objects.get(id=1)
    # context = {
    #     'title': obj.title,
    #     'description': obj.description,
    #     'price': obj.price,
    #     'summary': obj.summary,
    # }
    context = {
        'object': obj
    }
    return render(request, "documents/document_detail.html", context)
