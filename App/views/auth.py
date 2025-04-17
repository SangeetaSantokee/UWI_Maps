from flask import Blueprint, render_template, jsonify, request, flash, send_from_directory, flash, redirect, url_for
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import JWTManager,jwt_required, current_user, unset_jwt_cookies, set_access_cookies, create_access_token

from.index import index_views
from App.models import User

from App.controllers import (
    login,
    create_user
)

auth_views = Blueprint('auth_views', __name__, template_folder='../templates')

'''
Page/Action Routes
'''    
@auth_views.route('/users', methods=['GET'])
def get_user_page():
    users = get_all_users()
    return render_template('users.html', users=users)

@auth_views.route('/identify', methods=['GET'])
@jwt_required()
def identify_page():
    return render_template('message.html', title="Identify", message=f"You are logged in as {current_user.id} - {current_user.username}")

@auth_views.route('/login', methods=['POST'])
def login_action():
    data = request.form
    token = login(data['username'], data['password'])
    response = None
    if not token:
        flash('Invalid username or password given'), 401
        response = redirect(url_for('index_views.login_page'))
    else:
        user = User.query.filter_by(username=data['username']).first()
        flash('Login Successful')
        if user and user.isAdmin:
            response = redirect(url_for('index_views.admin_page'))
        else:
            response = redirect(url_for('index_views.home_page'))
        set_access_cookies(response, token) 
    return response

@auth_views.route('/logout', methods=['GET'])
def logout_action():
    response = redirect(url_for('index_views.login_page')) 
    flash("Logged Out!")
    unset_jwt_cookies(response)
    return response

@index_views.route("/signup", methods=['GET'])
def signup_page():
    return render_template("signup.html")

@index_views.route("/signup", methods=['POST'])
def signup_action():
    response = None

    try:
        username = request.form['username']
        password = request.form['password']

        if not username or not password:
            flash('Username and password are required.')
            return redirect(url_for('index_views.signup_page'))

        user = create_user(username=username, password=password)
        response = redirect(url_for('index_views.home_page'))
        token = create_access_token(identity=user.username)
        set_access_cookies(response, token)
    except IntegrityError:
        flash('Username already exists')
        response = redirect(url_for('index_views.signup_page'))
    flash('Account created')
    return response

@index_views.route("/admin", methods=['GET'])
@jwt_required()
def admin_page():
    if not current_user.isAdmin:
        flash("Access denied: Admins only!")
        return redirect(url_for('index_views.home_page'))
    return render_template("admin/index.html")


'''
API Routes
'''

@auth_views.route('/api/login', methods=['POST'])
def user_login_api():
  data = request.json
  token = login(data['username'], data['password'])
  if not token:
    return jsonify(message='bad username or password given'), 401
  response = jsonify(access_token=token) 
  set_access_cookies(response, token)
  return response

@auth_views.route('/api/identify', methods=['GET'])
@jwt_required()
def identify_user():
    return jsonify({'message': f"username: {current_user.username}, id : {current_user.id}"})

@auth_views.route('/api/logout', methods=['GET'])
def logout_api():
    response = jsonify(message="Logged Out!")
    unset_jwt_cookies(response)
    return response