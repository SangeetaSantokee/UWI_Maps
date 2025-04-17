from flask import Blueprint, request, jsonify
from App.models.marker import Marker
from App.database import db
from flask_jwt_extended import jwt_required

marker_views = Blueprint('marker_views', __name__)

@marker_views.route('/api/markers', methods=['GET'])
def get_markers():
    markers = Marker.query.all()
    return jsonify([m.get_json() for m in markers])

@marker_views.route('/api/markers', methods=['POST'])
@jwt_required()
def add_marker():
    data = request.json
    marker = Marker(
        name=data['name'],
        lat=data['lat'],
        lng=data['lng'],
        type=data['type'],
        faculty=data['faculty'],
        color=data['color']
    )
    db.session.add(marker)
    db.session.commit()
    return jsonify(marker.get_json()), 201


@marker_views.route('/api/markers/<int:id>', methods=['PUT'])
@jwt_required()
def update_marker(id):
    marker = Marker.query.get(id)
    if not marker:
        return {"error": "Marker not found"}, 404
    data = request.json
    marker.name = data.get('name', marker.name)
    marker.lat = data.get('lat', marker.lat)
    marker.lng = data.get('lng', marker.lng)
    marker.type = data.get('type', marker.type)
    marker.color = data.get('color', marker.color)
    db.session.commit()
    return jsonify(marker.get_json())

@marker_views.route('/api/markers/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_marker(id):
    marker = Marker.query.get(id)
    if not marker:
        return {"error": "Marker not found"}, 404
    db.session.delete(marker)
    db.session.commit()
    return {"message": "Deleted"}