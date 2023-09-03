all:

psls:
	clear
	docker images
	@echo "======================================"
	docker network ls
	@echo "======================================"
	docker volume ls
	@echo "======================================"
	docker ps -a

up:
	@echo "======================================"
	docker run $(image)
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
	docker-compose -f ./srcs/docker-compose.yml stop
	@echo "======================================"
	docker ps -a

rm:
	@echo "=Removing containers=================="
	docker rm -f $$(docker ps -aq)

rmi:
	@echo "=Removing images======================"
	docker rmi -f $$(docker images -q)

rst:
	@echo "=Restarting docker===================="
	sudo systemctl restart docker

netshoot:
	@echo "=Netshoot by Nicolaka================="
	docker run --rm -it --network $(NET) nicolaka/netshoot
	
clean: rm vol rst psls

fclean: clean rmi psls

.PHONY: all psls up stop rm rmi clean fclean
