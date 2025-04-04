"""
URL configuration for adam project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include

from pages.views import home_view, contact_view, about_view, landing_page_view
from documents.views import document_detail_view, document_create_view

urlpatterns = [
    path("admin/", admin.site.urls),
    path('', include('django.contrib.auth.urls')),

    path('', landing_page_view, name='landing-page'),
    path('home/', home_view, name='home'),
    path('about/', about_view),
    path('contact/', contact_view),

    path('document/', document_detail_view),
    path('create/', document_create_view),

    path('registration/', include('registration.urls')),
]
