import os
from django.core.management.base import BaseCommand
from apps.accounts.models import User

class Command(BaseCommand):
    help = 'Create superuser from environment variables (safe to run multiple times)'

    def handle(self, *args, **kwargs):
        username = os.environ.get('ADMIN_USERNAME', 'admin')
        password = os.environ.get('ADMIN_PASSWORD', '')
        email    = os.environ.get('ADMIN_EMAIL', '')

        if not password:
            self.stdout.write(self.style.WARNING(
                'ADMIN_PASSWORD not set — skipping admin creation.'
            ))
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f'Admin "{username}" already exists.'))
            return

        User.objects.create_superuser(
            username=username,
            password=password,
            email=email,
            role='admin',
        )
        self.stdout.write(self.style.SUCCESS(f'Admin "{username}" created successfully.'))
