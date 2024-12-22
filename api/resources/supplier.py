from flask import request
from flask_restful import Resource
from models import Supplier, Product
from schemas import SupplierSchema
from extensions import db
from flask_jwt_extended import jwt_required
from sqlalchemy import or_

supplier_schema = SupplierSchema()
supplier_list_schema = SupplierSchema(many=True)


class SupplierListResource(Resource):
    
    def get(self):
        # Query parameters
        search_query = request.args.get('search', type=str)
        category_ids = request.args.getlist('category_id', type=int)
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)

        # Base query
        query = Supplier.query.join(Product, Supplier.supplier_id == Product.supplier_id)

        # Apply filters
        if search_query:
            query = query.filter(
                or_(
                    Product.name.ilike(f'%{search_query}%'),
                    Product.upc.ilike(f'%{search_query}%')
                )
            )
        if category_ids:
            query = query.filter(Product.category_id.in_(category_ids))
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # Get unique suppliers
        suppliers = query.distinct().all()
        supplier_data = supplier_schema.dump(suppliers, many=True)
        return supplier_data, 200

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
