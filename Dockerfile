FROM denoland/deno:alpine-1.18.2

EXPOSE 8000
EXPOSE 8001
EXPOSE 8002

WORKDIR /app

USER deno

COPY . .
RUN deno cache deps.ts
RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "main.ts"]