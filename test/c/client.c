#include <string.h>
#include <strings.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <stdio.h>
#include <time.h>

int main(int argc, char**argv) {
	int canLoop = 1;
	int sockfd;
	int n;
	int port;
	int interval;
	char data[10000];
	char response[10000];
	struct sockaddr_in servaddr;
	struct sockaddr_in cliaddr;

	// check for the input arguments
	if (argc != 3) {
		printf("usage:  client <IP address> <port number>\n");
		return 1;
	}

	// cast port number
	sscanf(argv[2], "%d", &port);

	sockfd = socket(AF_INET, SOCK_STREAM, 0);

	bzero(&servaddr, sizeof(servaddr));
	servaddr.sin_family = AF_INET;
	servaddr.sin_addr.s_addr = inet_addr(argv[1]);
	servaddr.sin_port = htons(port);

	connect(sockfd, (struct sockaddr *)&servaddr, sizeof(servaddr));

	// keyboard input to send data
	while (fgets(data, 10000, stdin) != NULL) {
		// send data
		sendto(sockfd, data, strlen(data), 0, (struct sockaddr *)&servaddr, sizeof(servaddr));
		// recieve data
		n = recvfrom(sockfd, response, 10000, 0, NULL, NULL);
		response[n] = 0;
		// output
		fputs(strcat(response, "\n"), stdout);
        }
	
	return 0;
}
