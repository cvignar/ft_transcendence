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
	mkdir -p /ft_data/db
	mkdir -p /ft_data/upload

up:
	@echo "======================================"

	# zip backend.zip -rq ./backend
	# zip contracts.zip -rq ./contracts
	# zip frontend.zip -rq ./frontend
	# zip pong.zip -rq ./pong

	# mv backend.zip ./backend/backend.zip
	# mv contracts.zip ./backend/contracts.zip
	# mv frontend.zip ./frontend/frontend.zip
	# mv pong.zip ./pong/pong.zip

	docker-compose -f docker-compose.yml up -d --build

	# rm -f ./backend/backend.zip
	# rm -f ./backend/contracts.zip
	# rm -f ./frontend/frontend.zip
	# rm -f ./pong/pong.zip
	# rm -f ./backend/contracts.zip
	
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
	rm -fr /ft_data

rst:
	@echo "=Restarting docker===================="
	sudo systemctl restart docker

logs:
	docker-compose -f docker-compose.yml logs -f

netshoot:
	@echo "=Netshoot by Nicolaka================="
	docker run --rm -it --network $(NET) nicolaka/netshoot

clean: rm vol rst psls

fclean: clean rmi psls

.PHONY: all psls up stop rm rmi net vol rst logs clean fclean mkdir	
