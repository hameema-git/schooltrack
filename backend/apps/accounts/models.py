from django.contrib.auth.models import AbstractUser
from django.db import models

GRADE_CHOICES = [(str(i), f'Grade {i}') for i in range(1, 13)]
DIVISION_CHOICES = [('A','Div A'),('B','Div B'),('C','Div C'),('D','Div D'),('ALL','All Divisions')]
ROLE_CHOICES = [('parent','Parent'),('class_rep','Class Rep'),('teacher','Teacher'),('admin','Admin')]

class User(AbstractUser):
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='parent')
    grade = models.CharField(max_length=5, choices=GRADE_CHOICES, blank=True, null=True)
    division = models.CharField(max_length=5, choices=DIVISION_CHOICES, blank=True, null=True)
    child_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15, blank=True)

    def is_admin_or_teacher(self):
        return self.role in ('teacher', 'admin')

    def is_class_rep_or_above(self):
        return self.role in ('class_rep', 'teacher', 'admin')

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
