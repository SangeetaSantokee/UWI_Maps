from flask import Blueprint, redirect, render_template, request, send_from_directory, jsonify, url_for
from App.controllers import create_user, initialize

index_views = Blueprint('index_views', __name__, template_folder='../templates')

@index_views.route('/', methods=['GET'])
def login_page():
    return render_template('login.html')

@index_views.route('/init', methods=['GET'])
def init():
    initialize()
    return redirect(url_for('login_page'))

@index_views.route("/index", methods=['GET'])
def home_page():
    return render_template("index.html")

@index_views.route("/about", methods=['GET'])
def about_page():
    return render_template("about.html")

@index_views.route("/contact", methods=['GET'])
def contact_page():
    return render_template("contact.html")

@index_views.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status':'healthy'})