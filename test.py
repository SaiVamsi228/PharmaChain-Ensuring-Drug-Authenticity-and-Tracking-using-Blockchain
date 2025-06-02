import os

def copy_all_files_excluding_node_modules(source_dir, output_file):
    with open(output_file, 'wb') as outfile:
        for root, dirs, files in os.walk(source_dir):
            # Prevent walking into any 'node_modules' folder
            if 'node_modules' in dirs:
                dirs.remove('node_modules')

            for filename in files:
                filepath = os.path.join(root, filename)
                with open(filepath, 'rb') as infile:
                    outfile.write(infile.read())
                    outfile.write(b'\n')  # optional: add newline between files

source_directory = "PC Frontend"
output_file_path = "frontend.txt"

copy_all_files_excluding_node_modules(source_directory, output_file_path)

print(f"✅ All files copied into '{output_file_path}', ignoring any 'node_modules' folders.")
