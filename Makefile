PROJECT_PATH = /Users/uru/GoogleDrive/21_Projects/ft_transcendence/project
NET = ft_transcendence

all: mkdir up

psls:
	clear
	docker images
	@echo "======================================"
	docker network ls
	@echo "======================================"
	docker volume ls
	@echo "======================================"
	docker ps -a
	@echo "======================================"
	docker system df

mkdir:
	@echo "=Make dirictory data=================="
	mkdir -p ${PROJECT_PATH}/ft_data/db
	mkdir -p ${PROJECT_PATH}/ft_data/upload

up:
	@echo "======================================"
	docker-compose up --build
	@echo "======================================"
	docker images
	@echo "======================================"
	docker network ls
	@echo "======================================"
	docker volume ls
	@echo "======================================"
	docker ps -a

stop:
	@echo "=Stopping containers's stack=========="
	docker-compose -f docker-compose.yml stop
	@echo "======================================"
	docker ps -a

rm:
	@echo "=Removing containers=================="
	docker rm -f $$(docker ps -aq)

rmi:
	@echo "=Removing images======================"
	docker rmi -f $$(docker images -q)

net:
	@echo "=Removing network====================="
	docker network rm $(NET)

vol:
	@echo "=Removing volumes====================="
	docker volume rm $$(docker volume ls -q)

vold:
	@echo "=Removing directory data=============="
	rm -fr ${PROJECT_PATH}/ft_data

rst:
	@echo "=Restarting docker===================="
	# sudo systemctl restart docker

logs:
	docker-compose -f docker-compose.yml logs -f

netshoot:
	@echo "=Netshoot by Nicolaka================="
	docker run --rm -it --network $(NET) nicolaka/netshoot

clean: rm vol net rst psls

fclean: clean rmi psls

.PHONY: all psls up stop rm rmi net vol rst logs clean fclean mkdir	
