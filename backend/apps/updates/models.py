from django.db import models
from apps.accounts.models import User, GRADE_CHOICES, DIVISION_CHOICES

UPDATE_TYPES = [
    ('homework', 'Homework / Classwork'),
    ('test', 'Revision Test'),
    ('notice', 'Important Notice'),
    ('fee', 'Fee Reminder'),
    ('circular', 'PDF Circular'),
    ('event', 'Event / Holiday'),
    ('material', 'Textbook / Material'),
]

SUBJECT_CHOICES = [
    ('general', 'General'),
    ('english', 'English'),
    ('malayalam', 'Malayalam'),
    ('hindi', 'Hindi'),
    ('maths', 'Maths'),
    ('science', 'Science'),
    ('social', 'Social Science'),
    ('computer', 'Computer'),
    ('art', 'Art'),
    ('pe', 'PE / Sports'),
]

class SchoolUpdate(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='updates')
    grade = models.CharField(max_length=5, choices=GRADE_CHOICES)
    division = models.CharField(max_length=5, choices=DIVISION_CHOICES, default='ALL')
    update_type = models.CharField(max_length=20, choices=UPDATE_TYPES)
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES, default='general')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    amount = models.CharField(max_length=50, blank=True)
    attachment = models.FileField(upload_to='attachments/', null=True, blank=True)
    is_urgent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.grade}{self.division}] {self.title}"

class UpdateCompletion(models.Model):
    """Track which parent marked an update as done for their child"""
    update = models.ForeignKey(SchoolUpdate, on_delete=models.CASCADE, related_name='completions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('update', 'user')
