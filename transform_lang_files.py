import json
import os

def transform_json_structure(file_path):
    """
    Reads a JSON file with an array of arrays of key-value objects,
    transforms it to the new structure with a root 'string_groups' key,
    and overwrites the original file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_data = json.load(f)

        if not isinstance(original_data, list):
            print(f"Skipping {file_path}: Root is not an array as expected.")
            return

        new_string_groups = []
        for i, group_array in enumerate(original_data):
            if isinstance(group_array, list):
                new_group_object = {
                    "group_name": f"Group {i + 1}", # Generic group name
                    "items": group_array
                }
                new_string_groups.append(new_group_object)
            else:
                print(f"Skipping problematic group in {file_path}: Group {i+1} is not an array.")
                # Add the problematic group as is, or handle as needed
                # For now, let's add it if it's a simple list of items to not lose data
                # Or, more robustly, you might want to log and skip.
                # If the inner structures are guaranteed to be lists of dicts, this check might be simplified.
                new_string_groups.append({"group_name": f"Group {i+1} (unstructured)", "items": group_array})


        transformed_data = {"string_groups": new_string_groups}

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(transformed_data, f, ensure_ascii=False, indent=4) # indent for pretty printing

        print(f"Successfully transformed {file_path}")

    except json.JSONDecodeError:
        print(f"Error decoding JSON from {file_path}. Please check its format.")
    except Exception as e:
        print(f"An unexpected error occurred with {file_path}: {e}")

def main():
    langs_dir = os.path.join(os.path.dirname(__file__), 'static', 'strings', 'langs')
    
    if not os.path.isdir(langs_dir):
        print(f"Error: Directory not found: {langs_dir}")
        print("Please ensure the script is in the root of your 'atlas-of-emotions-1' project,")
        print("or adjust the 'langs_dir' path accordingly.")
        return

    print(f"Scanning for JSON files in: {langs_dir}")
    for filename in os.listdir(langs_dir):
        if filename.endswith('.json'):
            file_path = os.path.join(langs_dir, filename)
            print(f"Processing {file_path}...")
            transform_json_structure(file_path)

if __name__ == '__main__':
    main() 