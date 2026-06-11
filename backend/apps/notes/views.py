from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ClassNote, NoteImage, NoteHelpful
from .serializers import ClassNoteSerializer

@api_view(['GET', 'POST'])
def notes_list(request):
    if request.method == 'GET':
        qs = ClassNote.objects.prefetch_related('images', 'helpful_votes').all()
        grade   = request.query_params.get('grade')
        div     = request.query_params.get('division')
        subject = request.query_params.get('subject')
        date    = request.query_params.get('date')
        if grade:   qs = qs.filter(grade=grade)
        if div:     qs = qs.filter(Q(division=div) | Q(division='ALL'))
        if subject: qs = qs.filter(subject=subject)
        if date:    qs = qs.filter(class_date=date)
        return Response(ClassNoteSerializer(qs, many=True, context={'request': request}).data)

    # POST — any authenticated user can upload notes
    s = ClassNoteSerializer(data=request.data, context={'request': request})
    if not s.is_valid():
        return Response(s.errors, status=400)
    note = s.save(uploaded_by=request.user)

    images = request.FILES.getlist('images')
    for i, img in enumerate(images):
        NoteImage.objects.create(note=note, image=img, page_number=i + 1)

    return Response(ClassNoteSerializer(note, context={'request': request}).data, status=201)

@api_view(['GET'])
def note_detail(request, pk):
    try:
        note = ClassNote.objects.prefetch_related('images', 'helpful_votes').get(pk=pk)
    except ClassNote.DoesNotExist:
        return Response(status=404)
    return Response(ClassNoteSerializer(note, context={'request': request}).data)

@api_view(['DELETE'])
def note_delete(request, pk):
    try:
        note = ClassNote.objects.get(pk=pk)
    except ClassNote.DoesNotExist:
        return Response(status=404)
    if not (request.user == note.uploaded_by or request.user.is_admin_or_teacher()):
        return Response({'error': 'Permission denied'}, status=403)
    note.delete()
    return Response(status=204)

@api_view(['POST'])
def toggle_helpful(request, pk):
    try:
        note = ClassNote.objects.get(pk=pk)
    except ClassNote.DoesNotExist:
        return Response(status=404)
    vote, created = NoteHelpful.objects.get_or_create(note=note, user=request.user)
    if not created:
        vote.delete()
        return Response({'helpful': False, 'count': note.helpful_votes.count()})
    return Response({'helpful': True, 'count': note.helpful_votes.count()})
