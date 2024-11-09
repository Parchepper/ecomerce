from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import CartItem, Product
from schemas import CartItemSchema
from extensions import db
from flask import request

cart_item_schema = CartItemSchema()
cart_items_schema = CartItemSchema(many=True)

class CartResource(Resource):
    @jwt_required()
    def get(self):
        customer_id = get_jwt_identity()
        cart_items = CartItem.query.filter_by(customer_id=customer_id).all()
        return cart_items_schema.dump(cart_items), 200

    @jwt_required()
    def post(self):
        customer_id = get_jwt_identity()
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)

        if not product_id:
            return {'message': 'Product ID is required'}, 400

        # Check if product exists
        product = Product.query.get(product_id)
        if not product:
            return {'message': 'Product not found'}, 404

        # Check if the item is already in the cart
        cart_item = CartItem.query.filter_by(customer_id=customer_id, product_id=product_id).first()
        if cart_item:
            # Update the quantity
            cart_item.quantity += quantity
        else:
            # Add new cart item
            cart_item = CartItem(customer_id=customer_id, product_id=product_id, quantity=quantity)
            db.session.add(cart_item)

        db.session.commit()
        return cart_item_schema.dump(cart_item), 201

    @jwt_required()
    def delete(self):
        customer_id = get_jwt_identity()
        data = request.get_json()
        product_id = data.get('product_id')

        if not product_id:
            return {'message': 'Product ID is required'}, 400

        cart_item = CartItem.query.filter_by(customer_id=customer_id, product_id=product_id).first()
        if not cart_item:
            return {'message': 'Cart item not found'}, 404

        db.session.delete(cart_item)
        db.session.commit()
        return {'message': 'Cart item deleted'}, 200

    @jwt_required()
    def put(self):
        customer_id = get_jwt_identity()
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = data.get('quantity')

        if not product_id or quantity is None:
            return {'message': 'Product ID and quantity are required'}, 400

        cart_item = CartItem.query.filter_by(customer_id=customer_id, product_id=product_id).first()
        if not cart_item:
            return {'message': 'Cart item not found'}, 404

        cart_item.quantity = quantity
        db.session.commit()
        return cart_item_schema.dump(cart_item), 200
    
class CartClearResource(Resource):
    @jwt_required()
    def delete(self):
        customer_id = get_jwt_identity()
        CartItem.query.filter_by(customer_id=customer_id).delete()
        db.session.commit()
        return {'message': 'Cart cleared successfully'}, 200
    

