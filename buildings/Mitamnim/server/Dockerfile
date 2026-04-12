FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the server code
COPY . .

# Expose port 8401 for the backend service
EXPOSE 8401

# Run the server on port 8401
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8401"]