import json

from django.shortcuts import render_to_response
from django.http import HttpResponse

def home(request):
    return render_to_response('bare.html')

def page(request, page_id, section):
    if section is None and \
            request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        str_json = json.dumps({
            'id': page_id,
            'name': "Page %s face" % page_id
        })
        return HttpResponse(str_json, mimetype='application/json')

    section = section or 'priority'

    data = [
        {'id': 1, 'text': 'Hello'+page_id, 'description': section+'1'},
        {'id': 2, 'text': 'Hello'+page_id, 'description': section+'2'},
        {'id': 3, 'text': 'Hello'+page_id, 'description': section+'3'},
        {'id': 4, 'text': 'Hello'+page_id, 'description': section+'4'},
    ]
    str_json = json.dumps(data)

    # Differentiate between ajax and normal request, can bootstrap normal
    if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
        return HttpResponse(str_json, mimetype='application/json')
    else:
        return render_to_response('bare.html', {'data': str_json})

