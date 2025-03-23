from django.urls import path

from .views import (register
                    )
app_name = 'registration'
urlpatterns = [
    path('signup/', register, name='product-list'),
    # path('login/', include('django.contrib.auth.urls'), name='login'),
]
