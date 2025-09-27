import csv
import io

# Read the current CSV file
with open('patients.csv', 'r') as file:
    content = file.read()

# Process the content using string operations
lines = content.split('\n')
header = lines[0]
data_lines = [l for l in lines[1:] if l.strip()]  # Remove empty lines

# Process each line to update the file names
new_lines = []
new_lines.append(header)

for i, line in enumerate(data_lines):
    # Split the line carefully to preserve other fields
    parts = line.split(',')
    # The file path is the fourth field (index 3)
    file_num = i + 10  # Start from 10
    parts[3] = f'mri_scans/Tr-no_{file_num:04d}.jpg'
    # Reconstruct the line
    new_line = ','.join(parts)
    new_lines.append(new_line)

# Write back to the file
with open('patients.csv', 'w', newline='') as file:
    file.write('\n'.join(new_lines) + '\n')