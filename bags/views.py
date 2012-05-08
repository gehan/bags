import json

from django.shortcuts import render_to_response
from django.http import HttpResponse

def home(request):
    return render_to_response('bare.html')

def page(request, page_id, section):
    data = [
        {'id': 1, 'text': 'Hello'+page_id, 'description': section+'1'},
        {'id': 2, 'text': 'Hello'+page_id, 'description': section+'2'},
        {'id': 3, 'text': 'Hello'+page_id, 'description': section+'3'},
        {'id': 4, 'text': 'Hello'+page_id, 'description': section+'4'},
    ]
    str_json = json.dumps(data)
    return HttpResponse(str_json, mimetype='application/json')
