from flask import request
from flask_restful import Resource
from models import Supplier
from schemas import SupplierSchema
from extensions import db
from flask_jwt_extended import jwt_required

supplier_schema = SupplierSchema()
supplier_list_schema = SupplierSchema(many=True)

class SupplierListResource(Resource):
    def get(self):
        suppliers = Supplier.query.all()
        return supplier_list_schema.dump(suppliers), 200

    @jwt_required()
    def post(self):
        # Implement admin check
        data = request.get_json()
        supplier = supplier_schema.load(data)
        db.session.add(supplier)
        db.session.commit()
        return supplier_schema.dump(supplier), 201

class SupplierResource(Resource):
    def get(self, supplier_id):
        supplier = Supplier.query.get_or_404(supplier_id)
        return supplier_schema.dump(supplier), 200

    @jwt_required()
    def put(self, supplier_id):
        # Implement admin check
        supplier = Supplier.query.get_or_404(supplier_id)
        data = request.get_json()
        supplier = supplier_schema.load(data, instance=supplier, partial=True)
        db.session.commit()
        return supplier_schema.dump(supplier), 200

    @jwt_required()
    def delete(self, supplier_id):
        # Implement admin check
        supplier = Supplier.query.get_or_404(supplier_id)
        db.session.delete(supplier)
        db.session.commit()
        return {}, 204
