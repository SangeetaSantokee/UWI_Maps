from App.database import db

class Marker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # "Building" or "Classroom"
    faculty = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(20))

    def get_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'lat': self.lat,
            'lng': self.lng,
            'type': self.type,
            'faculty': self.faculty,
            'color': self.color
        }