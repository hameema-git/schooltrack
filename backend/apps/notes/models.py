from django.db import models
from apps.accounts.models import User, GRADE_CHOICES, DIVISION_CHOICES
from apps.updates.models import SUBJECT_CHOICES

class ClassNote(models.Model):
    """
    Scanned notes for a specific class, subject and date.
    Any parent can upload; all parents in that grade/div can view.
    Claude generates an AI summary of the content.
    """
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    grade = models.CharField(max_length=5, choices=GRADE_CHOICES)
    division = models.CharField(max_length=5, choices=DIVISION_CHOICES, default='ALL')
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    class_date = models.DateField()
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True, help_text="What was covered in class")
    ai_summary = models.TextField(blank=True, help_text="AI-generated summary of the notes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-class_date', '-created_at']

    def __str__(self):
        return f"[{self.grade}{self.division}] {self.subject} - {self.class_date}"

class NoteImage(models.Model):
    """Individual scanned page image for a ClassNote"""
    note = models.ForeignKey(ClassNote, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='notes/%Y/%m/')
    page_number = models.PositiveIntegerField(default=1)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['page_number']

class NoteHelpful(models.Model):
    """Track helpful votes on notes"""
    note = models.ForeignKey(ClassNote, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('note', 'user')
