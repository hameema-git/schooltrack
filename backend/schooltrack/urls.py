from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/updates/', include('apps.updates.urls')),
    path('api/notes/', include('apps.notes.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all: serve React index.html for every non-API route
# This makes React Router work on page refresh / direct URL
# urlpatterns += [
#     re_path(r'^(?!api/|admin/|static/|media/).*$',
#             TemplateView.as_view(template_name='index.html')),
# ]

urlpatterns += [
    re_path(
        r'^(?!api/|admin/).*$',
        TemplateView.as_view(template_name='index.html')
    ),
]
