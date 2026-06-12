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
]

# Media files
urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)

# React SPA catch-all
# Exclude API, admin, and static asset routes
urlpatterns += [
    re_path(
        r'^(?!api/|admin/|static/|media/|assets/|manifest\.json$|sw\.js$|favicon\.ico$|icon-192\.png$|icon-512\.png$).*$',
        TemplateView.as_view(template_name='index.html'),
        name='react-app'
    ),
]