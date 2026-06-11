from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SchoolUpdate, UpdateCompletion
from .serializers import SchoolUpdateSerializer

@api_view(['GET', 'POST'])
def updates_list(request):
    if request.method == 'GET':
        qs = SchoolUpdate.objects.all()
        grade   = request.query_params.get('grade')
        div     = request.query_params.get('division')
        utype   = request.query_params.get('type')
        subject = request.query_params.get('subject')
        if grade:   qs = qs.filter(grade=grade)
        if div:     qs = qs.filter(Q(division=div) | Q(division='ALL'))
        if utype:   qs = qs.filter(update_type=utype)
        if subject: qs = qs.filter(subject=subject)
        return Response(SchoolUpdateSerializer(qs, many=True, context={'request': request}).data)

    if not request.user.is_class_rep_or_above():
        return Response({'error': 'Only class reps and above can add updates'}, status=403)
    s = SchoolUpdateSerializer(data=request.data, context={'request': request})
    if s.is_valid():
        s.save(created_by=request.user)
        return Response(s.data, status=201)
    return Response(s.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def update_detail(request, pk):
    try:
        update = SchoolUpdate.objects.get(pk=pk)
    except SchoolUpdate.DoesNotExist:
        return Response(status=404)
    if request.method == 'GET':
        return Response(SchoolUpdateSerializer(update, context={'request': request}).data)
    if not (request.user == update.created_by or request.user.is_admin_or_teacher()):
        return Response({'error': 'Permission denied'}, status=403)
    if request.method == 'PUT':
        s = SchoolUpdateSerializer(update, data=request.data, partial=True, context={'request': request})
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)
    update.delete()
    return Response(status=204)

@api_view(['POST'])
def toggle_done(request, pk):
    try:
        update = SchoolUpdate.objects.get(pk=pk)
    except SchoolUpdate.DoesNotExist:
        return Response(status=404)
    completion, created = UpdateCompletion.objects.get_or_create(update=update, user=request.user)
    if not created:
        completion.delete()
        return Response({'done': False})
    return Response({'done': True})
