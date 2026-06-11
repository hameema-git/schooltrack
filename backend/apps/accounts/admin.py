from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ['username', 'get_full_name', 'role', 'grade', 'division', 'child_name', 'phone', 'is_active']
    list_filter   = ['role', 'grade', 'division', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'child_name', 'phone']
    ordering      = ['grade', 'division', 'last_name']

    fieldsets = UserAdmin.fieldsets + (
        ('School Info', {
            'fields': ('role', 'grade', 'division', 'child_name', 'phone')
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('School Info', {
            'fields': ('role', 'grade', 'division', 'child_name', 'phone')
        }),
    )
