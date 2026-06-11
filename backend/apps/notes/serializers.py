from rest_framework import serializers
from .models import ClassNote, NoteImage, NoteHelpful

class NoteImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NoteImage
        fields = ['id', 'image', 'image_url', 'page_number']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

class ClassNoteSerializer(serializers.ModelSerializer):
    images = NoteImageSerializer(many=True, read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()
    helpful_count = serializers.SerializerMethodField()
    is_helpful = serializers.SerializerMethodField()

    class Meta:
        model = ClassNote
        fields = ['id', 'uploaded_by', 'uploaded_by_name', 'grade', 'division',
                  'subject', 'class_date', 'title', 'description', 'ai_summary',
                  'images', 'helpful_count', 'is_helpful', 'created_at']
        read_only_fields = ['uploaded_by', 'ai_summary', 'created_at']

    def get_uploaded_by_name(self, obj):
        return obj.uploaded_by.get_full_name() or obj.uploaded_by.username

    def get_helpful_count(self, obj):
        return obj.helpful_votes.count()

    def get_is_helpful(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.helpful_votes.filter(user=request.user).exists()
        return False
