# resources/auth.py

from flask_restful import Resource
from flask import request
from models import Customer
from schemas import CustomerSchema
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

customer_schema = CustomerSchema()

class RegisterResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        if Customer.query.filter_by(email=email).first():
            return {'message': 'User already exists'}, 400
        password = data.get('password')
        if not password:
            return {'message': 'Password is required'}, 400
        hashed_password = generate_password_hash(password)
        new_customer = Customer(
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=email,
            password_hash=hashed_password,
            # Include other fields as necessary
        )
        db.session.add(new_customer)
        db.session.commit()
        access_token = create_access_token(identity=new_customer.customer_id)
        return {'token': access_token}, 201

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        customer = Customer.query.filter_by(email=email).first()
        if customer and check_password_hash(customer.password_hash, password):
            access_token = create_access_token(identity=customer.customer_id)
            return {'token': access_token}, 200
        else:
            return {'message': 'Invalid credentials'}, 401
