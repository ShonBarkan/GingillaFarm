FROM node:18-slim

RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install schedule

WORKDIR /app

RUN npm install -g mudslide

COPY bot.py .

CMD ["python3", "bot_test.py"]