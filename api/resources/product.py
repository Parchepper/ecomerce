# resources/product.py

from flask_restful import Resource
from flask import request
from models import Product, Category, Supplier, Customer
from schemas import ProductSchema
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

product_schema = ProductSchema()
product_list_schema = ProductSchema(many=True)

# resources/product.py


class ProductListResource(Resource):
    def get(self):
        # Get query parameters
        category_id = request.args.get('category_id', type=str)
        supplier_id = request.args.get('supplier_id', type=str)
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        search_query = request.args.get('search', type=str)
        page = request.args.get('page', 1, type=int)  # Default to page 1
        limit = request.args.get('limit', 10, type=int)  # Default to 10 items per page

        # Build the base query
        query = Product.query

        # Apply filters based on query parameters
        if category_id:
            query = query.filter(Product.category_id == category_id)
        if supplier_id:
            query = query.filter(Product.supplier_id == supplier_id)
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        if search_query:
            query = query.filter(Product.name.ilike(f'%{search_query}%'))

        

        # Apply pagination
        paginated_query = query.paginate(page=page, per_page=limit, error_out=False)
    
        products = paginated_query.items  # Items for the current page
        total_products = paginated_query.total  # Total number of products

        # Serialize the data with additional pagination metadata
        return {
            "products": product_list_schema.dump(products),
            "total": total_products,
            "page": page,
            "pages": paginated_query.pages,
            "per_page": limit
        }, 200


    @jwt_required()
    def post(self):
        # Check if the user is an admin
        user_id = get_jwt_identity()
        user = Customer.query.get(user_id)
        if not user or not user.is_admin:
            return {'message': 'Admin privileges required'}, 403

        data = request.get_json()
        
        # Process category_id or category_name
        category_id = data.get('category_id')
        if category_id:
            # Check if the provided category_id exists
            category = Category.query.get(category_id)
            if not category:
                return {'message': f'Category with ID {category_id} does not exist.'}, 400
        else:
            # Use category_name to find or create the category
            category_name = data.get('category_name')
            if not category_name:
                return {'message': 'Either category_id or category_name must be provided'}, 400
            category = Category.query.filter_by(name=category_name).first()
            if not category:
                category = Category(name=category_name)
                db.session.add(category)
                db.session.flush()  # Obtain category_id after flush
            category_id = category.category_id

        # Process supplier_id or supplier_name
        supplier_id = data.get('supplier_id')
        if supplier_id:
            # Check if the provided supplier_id exists
            supplier = Supplier.query.get(supplier_id)
            if not supplier:
                return {'message': f'Supplier with ID {supplier_id} does not exist.'}, 400
        else:
            # Use supplier_name to find or create the supplier
            supplier_name = data.get('supplier_name')
            if not supplier_name:
                return {'message': 'Either supplier_id or supplier_name must be provided'}, 400
            supplier = Supplier.query.filter_by(name=supplier_name).first()
            if not supplier:
                supplier = Supplier(name=supplier_name)
                db.session.add(supplier)
                db.session.flush()  # Obtain supplier_id after flush
            supplier_id = supplier.supplier_id

        # Remove category_name and supplier_name from data before loading with schema
        data['category_id'] = category_id
        data['supplier_id'] = supplier_id
        data.pop('category_name', None)  # Remove if exists
        data.pop('supplier_name', None)  # Remove if exists

        # Load product data and add to the database
        try:
            product = product_schema.load(data, session=db.session)
            db.session.add(product)
            db.session.commit()
            return product_schema.dump(product), 201
        except IntegrityError as e:
            db.session.rollback()
            return {'message': 'An integrity error occurred', 'details': str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {'message': 'An error occurred', 'details': str(e)}, 500



class ProductResource(Resource):
    def get(self, product_id):
        product = Product.query.get_or_404(product_id)
        return product_schema.dump(product), 200


    @jwt_required()
    def put(self, product_id):
        data = request.get_json()
        product = Product.query.get_or_404(product_id)
        product = product_schema.load(data, instance=product, session=db.session)
        db.session.commit()
        return product_schema.dump(product), 200

    @jwt_required()
    def delete(self, product_id):
        product = Product.query.get_or_404(product_id)
        db.session.delete(product)
        db.session.commit()
        return {'message': 'Product deleted'}, 200
