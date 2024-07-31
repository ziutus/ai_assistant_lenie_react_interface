FROM node:18.0-alpine3.15
LABEL authors="ziutus"

# Ustawiamy katalog roboczy w kontenerze
WORKDIR /app

# Kopiujemy package.json oraz yarn.lock do katalogu roboczego kontenera
COPY package*.json  ./

# Instalujemy zależności
RUN yarn install

# Kopiujemy resztę kodu aplikacji do katalogu roboczego kontenera
COPY . .

# Otwieramy port 3000
EXPOSE 3000

# Uruchamiamy aplikację
CMD ["yarn", "start"]
