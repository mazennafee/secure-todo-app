# challenge/Dockerfile

FROM node:18-alpine

WORKDIR /app

# Create package.json for vulnerable app
RUN echo '{"name": "vulnerable-todo-challenge", "version": "1.0.0", "type": "module", "dependencies": {"express": "^4.18.2", "body-parser": "^1.20.2"}}' > package.json

RUN npm install

COPY app/ ./app/

EXPOSE 3000

CMD ["node", "app/server.js"]
