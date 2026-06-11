from django.urls import path
from . import views

urlpatterns = [
    path('', views.updates_list),
    path('<int:pk>/', views.update_detail),
    path('<int:pk>/done/', views.toggle_done),
]
