# decorators.py

from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from models import Customer

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = Customer.query.get(user_id)
        if not user or not user.is_admin:
            return {'message': 'Admin privileges required'}, 403
        return fn(*args, **kwargs)
    return wrapper
