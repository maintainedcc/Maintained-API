FROM denoland/deno:alpine-1.11.1

EXPOSE 8000
EXPOSE 8001
EXPOSE 8002

WORKDIR /app

USER deno

COPY . .
RUN deno cache --unstable deps.ts
RUN deno cache --unstable main.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-plugin", "--unstable", "main.ts"]