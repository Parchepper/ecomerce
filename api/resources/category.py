from flask import request
from flask_restful import Resource
from models import Category
from schemas import CategorySchema
from extensions import db
from flask_jwt_extended import jwt_required

category_schema = CategorySchema()
category_list_schema = CategorySchema(many=True)

class CategoryListResource(Resource):
    def get(self):
        categories = Category.query.all()
        return category_list_schema.dump(categories), 200

    @jwt_required()
    def post(self):
        # Implement admin check
        data = request.get_json()
        category = category_schema.load(data)
        db.session.add(category)
        db.session.commit()
        return category_schema.dump(category), 201

class CategoryResource(Resource):
    def get(self, category_id):
        category = Category.query.get_or_404(category_id)
        return category_schema.dump(category), 200

    @jwt_required()
    def put(self, category_id):
        # Implement admin check
        category = Category.query.get_or_404(category_id)
        data = request.get_json()
        category = category_schema.load(data, instance=category, partial=True)
        db.session.commit()
        return category_schema.dump(category), 200

    @jwt_required()
    def delete(self, category_id):
        # Implement admin check
        category = Category.query.get_or_404(category_id)
        db.session.delete(category)
        db.session.commit()
        return {}, 204
