# models.py

from datetime import datetime, date
import uuid
from extensions import db
from sqlalchemy.orm import backref

def generate_uuid():
    return str(uuid.uuid4())

### Product Model

class Product(db.Model):
    __tablename__ = 'products'
    product_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category_id = db.Column(db.String(36), db.ForeignKey('categories.category_id'), nullable=False)
    supplier_id = db.Column(db.String(36), db.ForeignKey('suppliers.supplier_id'), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    cost = db.Column(db.Numeric(10, 2), nullable=False)
    sku = db.Column(db.String(100), nullable=False, unique=True)
    upc = db.Column(db.String(100), unique=False)
    weight = db.Column(db.Numeric(10, 2))
    dimensions = db.Column(db.String(255))
    safety_data_sheet_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # TODO uncomment below when adding individual product image functionality
    # image_url = db.Column(db.String(500))

    # Relationships
    category = db.relationship('Category', back_populates='products')
    supplier = db.relationship('Supplier', back_populates='products')
    order_items = db.relationship('OrderItem', back_populates='product', lazy=True)
    reviews = db.relationship('Review', back_populates='product', lazy=True)
    cart_items = db.relationship('CartItem', back_populates='product', lazy=True)

### Category Model

class Category(db.Model):
    __tablename__ = 'categories'
    category_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    parent_category_id = db.Column(db.String(36), db.ForeignKey('categories.category_id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = db.relationship('Product', back_populates='category')
    subcategories = db.relationship('Category',
                                    backref=backref('parent_category', remote_side=[category_id]))

### Supplier Model

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    supplier_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(255), nullable=False)
    contact_email = db.Column(db.String(255))
    contact_phone = db.Column(db.String(50))
    address = db.Column(db.String(500))
    website = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = db.relationship('Product', back_populates='supplier')

### Customer Model

class Customer(db.Model):
    __tablename__ = 'customers'
    customer_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    company_name = db.Column(db.String(255))
    email = db.Column(db.String(255), nullable=False, unique=True)
    phone_number = db.Column(db.String(50))
    billing_address = db.Column(db.String(500))
    shipping_address = db.Column(db.String(500))
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)

    # Relationships
    orders = db.relationship('Order', back_populates='customer', lazy=True)
    reviews = db.relationship('Review', back_populates='customer', lazy=True)
    cart_items = db.relationship('CartItem', back_populates='customer', lazy=True)
    cart = db.relationship('Cart', back_populates='customer', uselist=False)

### Order Model

class Order(db.Model):
    __tablename__ = 'orders'
    order_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.customer_id'), nullable=False)
    order_status = db.Column(db.Enum('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', name='order_status_enum'), default='Pending', nullable=False)
    payment_status = db.Column(db.Enum('Pending', 'Paid', 'Failed', 'Refunded', name='payment_status_enum'), default='Pending', nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    shipping_method = db.Column(db.String(100))
    tracking_number = db.Column(db.String(100))
    sales_tax = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    shipping_cost = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)    
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = db.relationship('Customer', back_populates='orders')
    order_items = db.relationship('OrderItem', back_populates='order', lazy=True)

### OrderItem Model

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    order_item_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    order_id = db.Column(db.String(36), db.ForeignKey('orders.order_id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.product_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    order = db.relationship('Order', back_populates='order_items')
    product = db.relationship('Product', back_populates='order_items')

### Inventory Model

class Inventory(db.Model):
    __tablename__ = 'inventory'
    inventory_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    product_id = db.Column(db.String(36), db.ForeignKey('products.product_id'), nullable=False, unique=True)
    quantity_in_stock = db.Column(db.Integer, nullable=False, default=0)
    reorder_level = db.Column(db.Integer, nullable=False, default=0)
    reorder_quantity = db.Column(db.Integer, nullable=False, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = db.relationship('Product', back_populates='inventory')

# Add back_populates to Product model
Product.inventory = db.relationship('Inventory', back_populates='product', uselist=False)

### Review Model

class Review(db.Model):
    __tablename__ = 'reviews'
    review_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    product_id = db.Column(db.String(36), db.ForeignKey('products.product_id'), nullable=False)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.customer_id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_approved = db.Column(db.Boolean, default=False)

    # Relationships
    product = db.relationship('Product', back_populates='reviews')
    customer = db.relationship('Customer', back_populates='reviews')

### Promotion Model

class Promotion(db.Model):
    __tablename__ = 'promotions'
    promotion_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    discount_type = db.Column(db.Enum('Percentage', 'FixedAmount', name='discount_type_enum'), nullable=False)
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    products = db.relationship('Product', secondary='promotion_products', back_populates='promotions')

### PromotionProducts Association Table

promotion_products = db.Table('promotion_products',
    db.Column('promotion_id', db.String(36), db.ForeignKey('promotions.promotion_id'), primary_key=True),
    db.Column('product_id', db.String(36), db.ForeignKey('products.product_id'), primary_key=True)
)

# Add promotions relationship to Product model
Product.promotions = db.relationship('Promotion', secondary=promotion_products, back_populates='products')

class Cart(db.Model):
    __tablename__ = 'carts'
    cart_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.customer_id'), nullable=False)

    # Relationship to Customer using back_populates
    customer = db.relationship('Customer', back_populates='cart')

### CartItem Model

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    cart_item_id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    customer_id = db.Column(db.String(36), db.ForeignKey('customers.customer_id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.product_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    customer = db.relationship('Customer', back_populates='cart_items')
    product = db.relationship('Product', back_populates='cart_items')

# Remove Cart model as it's unnecessary

