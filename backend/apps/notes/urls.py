from django.urls import path
from . import views

urlpatterns = [
    path('', views.notes_list),
    path('<int:pk>/', views.note_detail),
    path('<int:pk>/delete/', views.note_delete),
    path('<int:pk>/helpful/', views.toggle_helpful),
]
