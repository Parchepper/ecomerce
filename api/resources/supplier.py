# resources/supplier.py

from flask_restful import Resource
from flask import request
from models import Supplier
from schemas import SupplierSchema
from extensions import db
from flask_jwt_extended import jwt_required
from decorators import admin_required

supplier_schema = SupplierSchema()
supplier_list_schema = SupplierSchema(many=True)



class SupplierListResource(Resource):
    @admin_required
    def get(self):
        suppliers = Supplier.query.all()
        return supplier_list_schema.dump(suppliers), 200

    @admin_required
    def post(self):
        data = request.get_json()
        supplier = supplier_schema.load(data, session=db.session)
        db.session.add(supplier)
        db.session.commit()
        return supplier_schema.dump(supplier), 201
