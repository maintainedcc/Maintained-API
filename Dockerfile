
FROM denoland/deno:alpine-1.18.2 as builder

WORKDIR /app
USER deno
COPY . .

FROM builder as nightly
ENV PORT=8001
ENV ALLOWED_ORIGIN=https://nightly.maintained.cc
ENV DATABASE_HOST=172.17.0.1
ENV DATABASE_PORT=27027
ENV DATABASE_NAME=nightly
EXPOSE 8001
RUN deno cache main.ts
CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "main.ts"]

FROM builder as production
ENV PORT=8000
ENV ALLOWED_ORIGIN=https://maintained.cc
ENV DATABASE_HOST=172.17.0.1
ENV DATABASE_PORT=27027
ENV DATABASE_NAME=production
EXPOSE 8000
RUN deno cache main.ts
CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "main.ts"]