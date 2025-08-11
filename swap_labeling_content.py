#!/usr/bin/env python3

import json
import glob
import os

def swap_labeling_content(file_path):
    """Swap the key insight and image in the labeling section."""
    print(f"Processing {os.path.basename(file_path)}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Find the labeling section
        labeling_section = None
        reflecting = data.get('text', {}).get('reflecting', {})
        
        # Look in sub_sections of reflecting
        for section in reflecting.get('sub_sections', []):
            if section.get('id') == 'labeling':
                labeling_section = section
                break
        
        if not labeling_section:
            print(f"✗ No labeling section found in {os.path.basename(file_path)}")
            return False
        
        paragraphs = labeling_section.get('paragraphs', [])
        if len(paragraphs) < 2:
            print(f"✗ Not enough paragraphs in labeling section in {os.path.basename(file_path)}")
            return False
        
        # Get the first and second paragraphs
        first_paragraph = paragraphs[0]
        second_paragraph = paragraphs[1]
        
        # Extract the content to swap
        image_from_first = first_paragraph.get('image')
        insight_from_second = second_paragraph.get('insight')
        insight_image_from_second = second_paragraph.get('insight_image')
        
        if not image_from_first or not insight_from_second:
            print(f"✗ Missing expected properties in {os.path.basename(file_path)}")
            print(f"   First paragraph has image: {bool(image_from_first)}")
            print(f"   Second paragraph has insight: {bool(insight_from_second)}")
            return False
        
        # Perform the swap
        # Remove image from first paragraph
        if 'image' in first_paragraph:
            del first_paragraph['image']
        
        # Add insight and insight_image to first paragraph
        first_paragraph['insight'] = insight_from_second
        if insight_image_from_second:
            first_paragraph['insight_image'] = insight_image_from_second
        
        # Remove insight and insight_image from second paragraph
        if 'insight' in second_paragraph:
            del second_paragraph['insight']
        if 'insight_image' in second_paragraph:
            del second_paragraph['insight_image']
        
        # Add image to second paragraph
        second_paragraph['image'] = image_from_first
        
        # Write the updated data back to the file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Successfully swapped content in {os.path.basename(file_path)}")
        return True
        
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all strategies JSON files."""
    print("Swapping key insight and image in labeling section across all language files...\n")
    
    # Find all strategies JSON files
    strategies_pattern = "/Users/jjs/Documents/Business/Atlas_of_Emotions/atlas-of-emotions-1/static/strings/langs/strategies.*.json"
    strategies_files = glob.glob(strategies_pattern)
    
    if not strategies_files:
        print("No strategies JSON files found!")
        return
    
    print(f"Found {len(strategies_files)} strategies files to process:")
    for file in strategies_files:
        print(f"  - {os.path.basename(file)}")
    print()
    
    # Process each file
    success_count = 0
    for file_path in strategies_files:
        if swap_labeling_content(file_path):
            success_count += 1
    
    print(f"\nCompleted! Successfully processed {success_count}/{len(strategies_files)} files.")
    
    if success_count == len(strategies_files):
        print("All labeling sections have been updated with swapped content.")
    else:
        print("Some files had errors. Please check the output above.")

if __name__ == "__main__":
    main()
