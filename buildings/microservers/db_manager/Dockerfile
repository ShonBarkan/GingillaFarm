# Use Python slim for a lightweight container
FROM python:3.11-slim

# Set the work directory inside the container
WORKDIR /app

# Copy dependency file
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the microservice source code
COPY . .

# The Silo usually runs on 8000 internally
EXPOSE 8000

# Start the DB Manager
CMD ["python", "main.py"]