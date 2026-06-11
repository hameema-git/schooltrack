from django.contrib import admin
from .models import SchoolUpdate, UpdateCompletion

@admin.register(SchoolUpdate)
class SchoolUpdateAdmin(admin.ModelAdmin):
    list_display  = ['title', 'update_type', 'grade', 'division', 'subject', 'due_date', 'is_urgent', 'created_by', 'created_at']
    list_filter   = ['update_type', 'grade', 'division', 'subject', 'is_urgent']
    search_fields = ['title', 'description']
    ordering      = ['-created_at']

@admin.register(UpdateCompletion)
class UpdateCompletionAdmin(admin.ModelAdmin):
    list_display = ['update', 'user', 'completed_at']
