import os
from collections import defaultdict

# Get the list of files in the current directory
files = os.listdir('./img/background')

# Print the list of all files (for debugging)
print("Files in directory:", files)

# Initialize a dictionary to count extensions
extension_counts = defaultdict(int)

# Filter and count image files by extension
image_files = []
for f in files:
    if f.endswith(('.jpg', '.jpeg', '.png', '.gif')):
        image_files.append(f)
        # Extract the extension (in lowercase to avoid case sensitivity issues)
        ext = f.split('.')[-1].lower()
        extension_counts[ext] += 1

# Print the list of image files (for debugging)
print("Image files:", image_files)

# Sort the image files (optional, for consistent ordering)
image_files.sort()

# Create the JavaScript mapping
background_images = "const backgroundImages = {\n"
for i, filename in enumerate(image_files, 1):
    background_images += f"    {i}: '{filename}',\n"
background_images += "    // Add more mappings as needed\n};"

# Write the output to a JavaScript file
with open('backgroundImages.js', 'w') as js_file:
    js_file.write(background_images)

# Print summary of conversions
print("\nConversion Summary:")
print(f"Total files processed: {len(files)}")
print(f"Total image files: {len(image_files)}")
for ext, count in extension_counts.items():
    print(f"{ext.upper()}: {count}")

print("JavaScript object generated and saved to backgroundImages.js")