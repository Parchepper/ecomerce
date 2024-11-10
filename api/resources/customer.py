from flask import request, make_response, jsonify
from flask_restful import Resource
from models import Customer
from schemas import CustomerSchema, CustomerUpdateSchema
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

customer_schema = CustomerSchema(session=db.session)




class CustomerProfileResource(Resource):

    methods = ['GET', 'PUT', 'OPTIONS']

    @jwt_required()
    def get(self):
        customer_id = get_jwt_identity()
        customer = Customer.query.get_or_404(customer_id)
        return customer_schema.dump(customer), 200

    @jwt_required()
    def put(self):
        customer_id = get_jwt_identity()
        customer = Customer.query.get_or_404(customer_id)
        data = request.get_json()
        schema = CustomerUpdateSchema(session=db.session)
        print(data)
        errors = schema.validate(data, partial=True)
        if errors:
            return {'message': 'Validation errors', 'errors': errors}, 400

        # Update customer fields
        customer.first_name = data.get('first_name', customer.first_name)
        customer.last_name = data.get('last_name', customer.last_name)
        customer.phone_number = data.get('phone_number', customer.phone_number)
        customer.billing_address = data.get('billing_address', customer.billing_address)

        db.session.commit()
        return customer_schema.dump(customer), 200
    
    @jwt_required()
    def options(self):
        # Allow CORS preflight requests
        response = {"headers": {"Access-Control-Allow-Origin": '*', 'Access-Control-Allow-Methods': "GET, PUT, OPTIONS",  'Access-Control-Allow-Headers': "Authorization, Content-Type"}}
 
        return response, 200
        # return {'Allow': 'GET, PUT, OPTIONS'}, 200, {
        #     'Access-Control-Allow-Origin': 'http://localhost:8000',
        #     'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        #     'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        # }
    
    
