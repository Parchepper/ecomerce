import csv
from decimal import Decimal, DecimalException
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from models import Product, Category, Supplier, generate_uuid  # Import your models here

# Replace 'your_database_connection_string' with your actual database connection string
from app import create_app
from extensions import db


engine = create_engine('postgresql://postgres:admin@localhost:5432/ecommerce_db')
Session = sessionmaker(bind=engine)
session = Session()


def main():
    data_file = 'ecom-price-list.txt'  # Replace with the path to your data file

    # app = create_app()
    # with app.app_context():
    #     db.create_all()

    with open(data_file, 'r') as f:
        reader = csv.reader(f, delimiter='\t')

        # Skip the header row
        next(reader, None)

        for row in reader:
            # Skip empty lines
            if not row :
                
                continue

            try:
                # Map columns to variables
                sku = row[0].strip()
                upc = row[1].strip() or None
                supplier_name = row[2].strip()
                name = row[3].strip()
                description = row[3].strip()  # Using English description
                price_str = row[8].strip() 
                cost = row[9].strip()
                weight = row[4].strip()
                dimensions = f'{row[5].strip()}" x {row[6].strip()}" x {row[7].strip()}"'
                category_name = row[11].strip()

                # Convert price to Decimal
                try:
                    price = Decimal(price_str) if price_str else Decimal('0.00')
                except DecimalException as de:
                    print(f"Invalid price '{price_str}' for SKU '{sku}'. Setting price to 0.00.")
                    price = Decimal('0.00')

                
                # Lookup or create supplier
                supplier = session.query(Supplier).filter_by(name=supplier_name).first()
                if not supplier:
                    supplier = Supplier(supplier_id=generate_uuid(), name=supplier_name)
                    session.add(supplier)
                    session.commit()

                # Lookup or create category
                category = session.query(Category).filter_by(name=category_name).first()
                if not category:
                    category = Category(category_id=generate_uuid(), name=category_name)
                    session.add(category)
                    session.commit()

                # Check if product already exists
                existing_product = session.query(Product).filter_by(sku=sku).first()
                if existing_product:
                    print(f"Product with SKU {sku} already exists. Skipping.")
                    continue

                # Create Product
                product = Product(
                    product_id=generate_uuid(),
                    name=name,
                    description=description,
                    category_id=category.category_id,
                    supplier_id=supplier.supplier_id,
                    price=price,
                    cost=cost,
                    sku=sku,
                    upc=upc,
                    weight=weight,
                    dimensions=dimensions,
                    is_active=True                    
                )

                session.add(product)

            except Exception as e:
                print(f"Error processing row: {row}")
                print(f"Exception: {e}")
                session.rollback()  # Rollback the session
                continue

    # Commit the session after processing all rows
    try:
        session.commit()
        print("Data import completed successfully.")
    except Exception as e:
        session.rollback()
        print(f"Error committing session: {e}")

if __name__ == '__main__':
    main()
