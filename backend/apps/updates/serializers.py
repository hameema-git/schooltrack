from rest_framework import serializers
from .models import SchoolUpdate, UpdateCompletion
from apps.accounts.serializers import UserSerializer

class SchoolUpdateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    is_done = serializers.SerializerMethodField()
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = SchoolUpdate
        fields = ['id', 'created_by', 'created_by_name', 'grade', 'division',
                  'update_type', 'subject', 'title', 'description', 'due_date',
                  'amount', 'attachment', 'attachment_url', 'is_urgent',
                  'is_done', 'created_at']
        read_only_fields = ['created_by', 'created_at']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.username

    def get_is_done(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.completions.filter(user=request.user).exists()
        return False

    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
        return None
