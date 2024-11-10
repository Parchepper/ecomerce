from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, CartItem, Product
from schemas import OrderSchema
from datetime import datetime
from decimal import Decimal
from flask import jsonify

class OrdersResource(Resource):
    @jwt_required()
    def post(self):
        # Get the current user's ID
        customer_id = get_jwt_identity()

        # Get cart items for the user
        cart_items = CartItem.query.filter_by(customer_id=customer_id).all()

        if not cart_items:
            return {'message': 'No items in cart to checkout.'}, 400

        # Calculate total amount
        subtotal = Decimal('0.00')
        for item in cart_items:
            subtotal += item.product.price * item.quantity

        # Calculate sales tax
        sales_tax_rate = Decimal('0.13') # For example, 13%
        sales_tax = subtotal * sales_tax_rate

        # Calculate shipping cost
        shipping_cost = self.calculate_shipping(cart_items)

        # Calculate total amount
        total_amount = subtotal + sales_tax + shipping_cost

        # Create a new order
        order = Order(
            customer_id=customer_id,
            total_amount=total_amount,
            sales_tax=sales_tax,
            shipping_cost=shipping_cost,
            order_status='Pending',
            payment_status='Pending',
            order_date=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(order)
        db.session.flush()  # Flush to get the order_id

        # Create order items
        for item in cart_items:
            order_item = OrderItem(
                order_id=order.order_id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.product.price,
                total_price=item.product.price * item.quantity,
                created_at=datetime.utcnow()
            )
            db.session.add(order_item)

        # Clear the cart - reimplement for after checkout into payment
        #CartItem.query.filter_by(customer_id=customer_id).delete()

        db.session.commit()

        # Return the order details
        order_schema = OrderSchema()
        return order_schema.dump(order), 201

    def calculate_shipping(self, cart_items):
        # Implement your shipping calculation logic here
        # For simplicity, we'll use a flat rate shipping cost
        shipping_cost = Decimal('10.00')
        return shipping_cost

    @jwt_required()
    def get(self):
        customer_id = get_jwt_identity()
        orders = Order.query.filter_by(customer_id=customer_id).all()
        if not orders:
            return {'message': 'Order not found'}, 404
        order_schema = OrderSchema(many=True)
        return order_schema.dump(orders), 200
    
class OrderResource(Resource):
    @jwt_required()
    def get(self, order_id):
        customer_id = get_jwt_identity()
        order = Order.query.filter_by(order_id=order_id, customer_id=customer_id).first()
        if not order:
            return {'message': 'Order not found'}, 404
        order_schema = OrderSchema()
        return order_schema.dump(order), 200
        