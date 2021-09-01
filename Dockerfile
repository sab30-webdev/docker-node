FROM node
WORKDIR /app
COPY package.json .

ARG NODE_ENVI
RUN if [ "$NODE_ENVI" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi

COPY . ./
ENV PORT 3000             
EXPOSE $PORT
CMD ["node","index.js"]


