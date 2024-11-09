# schemas.py

from marshmallow import fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from extensions import db  # Add this import
from models import (
    Product, Category, Supplier, Customer,
    Order, OrderItem, Cart, CartItem,
    Review, Promotion
)
# schemas.py

# Category Schema

class DecimalAsFloat(fields.Field):
    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None
        return float(value)

class CategorySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Category
        load_instance = True
        include_fk = True

    subcategories = fields.Nested(
        lambda: CategorySchema(exclude=('subcategories',)),
        many=True
    )


### Product Schema

class ProductSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Product
        load_instance = True
        include_fk = True
        sqla_session = db.session

    # Customize fields if necessary
    
   #image_urls = fields.Method("get_image_urls")

     # Apply custom Decimal to float conversion
    price = DecimalAsFloat()
    weight = DecimalAsFloat()

    def get_image_urls(self, obj):
        # Implement logic to retrieve image URLs if you have an Image model
        return []



### Supplier Schema

# schemas.py

class SupplierSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Supplier
        load_instance = True
        include_fk = True
        sqla_session = db.session


### Customer Schema

class CustomerSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Customer
        load_instance = True
        include_fk = True
        exclude = ('password_hash',)  # Exclude password hash from serialization

    password = fields.String(load_only=True)  # For registration and login

### Order Schema

class OrderSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Order
        load_instance = True
        include_fk = True

    order_items = fields.Nested('OrderItemSchema', many=True)

### OrderItem Schema

class OrderItemSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = OrderItem
        load_instance = True
        include_fk = True

### Cart Schema

class CartSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Cart
        load_instance = True
        include_fk = True

    cart_items = fields.Nested('CartItemSchema', many=True)

### CartItem Schema

class CartItemSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = CartItem
        load_instance = True
        include_fk = True
        load_only = ('customer_id',)
        sqla_session = db.session  # Ensure to provide the session

    product = fields.Nested('ProductSchema', only=('product_id', 'name', 'price', ))

# TODO will need to re-add image link to the only= above when created 'image_url' check model

### Review Schema

class ReviewSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Review
        load_instance = True
        include_fk = True

### Promotion Schema

class PromotionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Promotion
        load_instance = True
        include_fk = True

    products = fields.Nested('ProductSchema', many=True)
