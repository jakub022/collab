FROM node:slim AS frontend
WORKDIR /app/collab
COPY collab/package.json collab/package-lock.json ./
RUN npm install
COPY collab/ ./
RUN npm run build

FROM python:3.13-slim AS backend
WORKDIR /app/collab-backend
COPY collab-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY collab-backend/ ./

COPY --from=frontend /app/collab/dist /app/collab/dist

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]