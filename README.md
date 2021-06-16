# Maintained API

API and identity management for [maintained.cc](https://maintained.cc). For the frontend, see [maintainedcc/Maintained](https://github.com/maintainedcc/Maintained).

## docker-compose.yml
```docker
version: 3.8

services:
	server:
		build: .
		ports:
			- 8002:8002
			- 8001:8001
			- 8000:8000
	mongo:
		image: mongo
		restart: always
		environment:
			MONGO_INITDB_ROOT_USERNAME: root
			MONGO_INITDB_ROOT_PASSWORD: password
```