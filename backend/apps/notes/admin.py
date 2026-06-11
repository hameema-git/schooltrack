from django.contrib import admin
from .models import ClassNote, NoteImage, NoteHelpful

class NoteImageInline(admin.TabularInline):
    model = NoteImage
    extra = 0

@admin.register(ClassNote)
class ClassNoteAdmin(admin.ModelAdmin):
    list_display  = ['__str__', 'subject', 'class_date', 'grade', 'division', 'uploaded_by', 'created_at']
    list_filter   = ['grade', 'division', 'subject']
    search_fields = ['title', 'description', 'ai_summary']
    ordering      = ['-class_date']
    inlines       = [NoteImageInline]

@admin.register(NoteHelpful)
class NoteHelpfulAdmin(admin.ModelAdmin):
    list_display = ['note', 'user', 'created_at']
