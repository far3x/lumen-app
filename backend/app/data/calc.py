import pandas as pd

# Define the file name
file_name = 'airdrop_snapshot.csv'

try:
    # Read the CSV file into a pandas DataFrame
    # The first row of your data is the header
    df = pd.read_csv(file_name)

    # Select the 'Quantity' column and calculate its sum
    total_supply = df['Quantity'].sum()

    # Print the result in a formatted way
    print(f"Successfully read the file: {file_name}")
    print(f"The sum of the 'Quantity' column is: {total_supply:,.7f}")

except FileNotFoundError:
    print(f"Error: The file '{file_name}' was not found.")
    print("Please make sure the CSV file is in the same directory as the script.")
except KeyError:
    print("Error: A 'Quantity' column was not found in the CSV file.")
    print("Please ensure the column name is correct.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")