all: mkdir up psls

psls:
	docker images
	docker network ls
	docker volume ls
	docker ps -a

mkdir:
	sudo mkdir -p ../db_vol
	
up:
	docker-compose up -d --build
	docker network ls
	docker volume ls
	docker ps -a

stop:
	docker-compose stop
	docker ps -a

rm:
	docker rm -f $$(docker ps -aq)

rmi:
	docker rmi -f $$(docker images -q)

vol:
	docker volume rm $$(docker volume ls -q)

vold:
	sudo rm -fr ../db_vol
	
rst:
	sudo systemctl restart docker

logs:
	docker-compose logs -f
	
clean: rm vol rmi rst psls

fclean: clean vold psls

.PHONY: all psls up stop rm rmi vol rst logs clean fclean mkdir