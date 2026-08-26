FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y curl

# Copia apenas arquivos de dependência
COPY package*.json ./

RUN npm install

RUN mkdir -p infra/model && cd infra/model && \
    for f in \
      tiny_face_detector_model-weights_manifest.json \
      tiny_face_detector_model-shard1 \
      face_landmark_68_model-weights_manifest.json \
      face_landmark_68_model-shard1 \
      face_recognition_model-weights_manifest.json \
      face_recognition_model-shard1 \
      face_recognition_model-shard2 \
      ssd_mobilenetv1_model-weights_manifest.json \
      ssd_mobilenetv1_model-shard1 \
      ssd_mobilenetv1_model-shard2; do \
        curl -sL -o "$f" "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/$f"; \
    done

# Copia o resto do projeto (arquivos que não foram ignorados pelo .dockerignore)
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]