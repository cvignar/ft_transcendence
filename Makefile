NET =   ft_transcendence

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

mkdir:
	@echo "=Make dirictory data=================="
#	mkdir -p ~/data/html

up:
	@echo "======================================"
#	docker-compose -f docker-compose.yml up -d --build
	zip pong.zip -r ./pong
	docker build . --tag pong
	rm -f pong.zip
#	docker run pong
	docker run -dp 12080:12080 pong
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
#	docker-compose -f docker-compose.yml stop
	docker stop pong
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
#	sudo rm -fr ~/data

rst:
	@echo "=Restarting docker===================="
	sudo systemctl restart docker
logs:
#	docker-compose -f docker-compose.yml logs -f

netshoot:
	@echo "=Netshoot by Nicolaka================="
	docker run --rm -it --network $(NET) nicolaka/netshoot

clean: rm net vol rst psls

fclean: clean rmi vold psls

.PHONY: all psls up stop rm rmi net vol rst logs clean fclean mkdir	
