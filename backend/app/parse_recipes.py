import json
import psycopg2
import os

def SafeIntConversion(value, default=0):
    
    if value is None:
        return default
    try:
        
        numeric_part = ''.join(filter(str.isdigit, str(value).split()[0]))
        return int(numeric_part) if numeric_part else default
    except Exception:
        return default

def SafeRealConversion(value, default=None):
    
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def InsertRecipesToDB(json_file):
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, json_file)

    db_params = {
        "host": "localhost",
        "database": "recipe_db",
        "user": "postgres",
        "password": "ADMIN"
    }
  

    conn = None
    cursor = None
    insert_count = 0
    skip_count = 0

    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        print(f"Successfully loaded {len(data)} recipes from '{json_file}'.")

        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()

        
        for recipe_id, recipe_data in data.items():
            
           
            title = recipe_data.get("title")
            
            if not title:
                print(f"Skipping record ID {recipe_id}: No title found.")
                skip_count += 1
                continue
                
            cuisine = recipe_data.get("cuisine")
            rating = SafeRealConversion(recipe_data.get("rating"))
            

            prep_time = SafeIntConversion(recipe_data.get("prep_time"))
            cook_time = SafeIntConversion(recipe_data.get("cook_time"))
            total_time = SafeIntConversion(recipe_data.get("total_time"))
            
            description = recipe_data.get("description")
            serves = recipe_data.get("serves")
            
          
            nutrients_dict = recipe_data.get("nutrients", {})
            nutrients_json = json.dumps(nutrients_dict)
            
           
            calories_str = nutrients_dict.get("calories")
            calories_int = SafeIntConversion(calories_str)

           
            check_query = "SELECT title FROM recipes WHERE title = %s;"
            cursor.execute(check_query, (title,))
            
            if cursor.fetchone() is not None:
                print(f"Skipping '{title}': Duplicate recipe found.")
                skip_count += 1
                continue

            
            insert_query = """
            INSERT INTO recipes (
                cuisine, title, rating, prep_time, cook_time, total_time, 
                description, nutrients, calories_int, serves
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """

            cursor.execute(insert_query, (
                cuisine, title, rating, prep_time, cook_time, total_time,
                description, nutrients_json, calories_int, serves
            ))
            insert_count += 1

       
        conn.commit()
        print("\n**** Summary ****")
        print(f"Data insertion complete.")
        print(f"Total records processed: {len(data)}")
        print(f"Successfully inserted: {insert_count} recipes.")
        print(f"Skipped (Duplicate/No Title): {skip_count} recipes.")
        print("\n**** end ****")


    except psycopg2.Error as db_error:
        
        if conn:
            conn.rollback()
        print(f"Internal Database Error: {db_error}")

    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")

    except json.JSONDecodeError:
        print(f"Error: Failed to decode JSON from '{file_path}'. Check the file is valid JSON.")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            print("Database connection is closed.")


if __name__ == "__main__":
    InsertRecipesToDB('recipes.json')
