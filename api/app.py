from flask import Flask, make_response
from flask_migrate import Migrate
from flask_restful import Api
from config import Config
from extensions import db, jwt
from resources.product import ProductListResource, ProductResource
from resources.category import CategoryListResource, CategoryResource
from resources.auth import RegisterResource, LoginResource
from resources.customer import CustomerProfileResource
from resources.cart import CartResource
from resources.orders import OrderResource, OrdersResource
from resources.cart import CartClearResource
from resources.supplier import SupplierListResource, SupplierResource
# Import other resources...

from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    # app.config['JWT_TOKEN_LOCATION'] = ['headers']
    # app.config['JWT_EXEMPT_METHODS'] = ['OPTIONS']


    CORS(app, origins="*")  # Enable CORS

     

    db.init_app(app)
    jwt.init_app(app)
    migrate = Migrate(app, db)

    api = Api(app)

    # Register resources
    # ...

    # Register endpoints
    api.add_resource(ProductListResource, '/api/products')
    api.add_resource(ProductResource, '/api/products/<string:product_id>')
    api.add_resource(CategoryListResource, '/api/categories')
    api.add_resource(CategoryResource, '/api/categories/<string:category_id>')
    api.add_resource(RegisterResource, '/api/auth/register')
    api.add_resource(LoginResource, '/api/auth/login')
    api.add_resource(CartResource, '/api/cart')
    api.add_resource(CustomerProfileResource, '/api/customer/profile')
    api.add_resource(OrdersResource, '/api/orders')
    api.add_resource(OrderResource, '/api/orders/<string:order_id>')
    api.add_resource(CartClearResource, '/api/cart/clear')
    api.add_resource(SupplierListResource, '/api/suppliers')
    api.add_resource(SupplierResource, '/api/suppliers/<string:supplier>')

    
    
    
    
    # Add other resources...

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
