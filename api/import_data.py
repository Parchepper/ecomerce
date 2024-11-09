import csv
from decimal import Decimal, DecimalException
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from models import Product, Category, Supplier, generate_uuid  # Import your models here

# Replace 'your_database_connection_string' with your actual database connection string
engine = create_engine('postgresql://postgres:admin@localhost:5432/ecommerce_db')
Session = sessionmaker(bind=engine)
session = Session()

def main():
    data_file = 'test_data.txt'  # Replace with the path to your data file

    with open(data_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter='\t')

        # Skip the header row
        next(reader, None)

        for row in reader:
            # Skip empty lines
            if not row or len(row) < 24:
                continue

            try:
                # Map columns to variables
                sku = row[0].strip()
                upc = row[1].strip() or None
                supplier_name = row[2].strip()
                name = row[4].strip()
                description = row[4].strip()  # Using English description
                price_str = row[10].strip()
                created_at_str = row[21].strip()
                category_name = row[22].strip()

                # Convert price to Decimal
                try:
                    price = Decimal(price_str) if price_str else Decimal('0.00')
                except DecimalException as de:
                    print(f"Invalid price '{price_str}' for SKU '{sku}'. Setting price to 0.00.")
                    price = Decimal('0.00')

                # Parse date
                if created_at_str:
                    try:
                        created_at = datetime.strptime(created_at_str, '%Y-%m-%dT%H:%M:%SZ')
                    except ValueError:
                        print(f"Invalid date '{created_at_str}' for SKU '{sku}'. Using current datetime.")
                        created_at = datetime.utcnow()
                else:
                    created_at = datetime.utcnow()

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
                    sku=sku,
                    upc=upc,
                    is_active=True,
                    created_at=created_at,
                    updated_at=created_at
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
