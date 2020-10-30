# inspired from sta, learn and personalize (pending)
FROM node:14.4.0-alpine3.12 as build
RUN apk add --no-cache bash curl
WORKDIR /app
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn
COPY . /app
RUN yarn build

FROM nginx:1.19.0-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]