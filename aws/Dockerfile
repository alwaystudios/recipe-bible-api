FROM postgres:latest

RUN apt-get update
RUN apt-get -y install unzip build-essential wget

RUN wget https://github.com/darold/pgbadger/archive/v11.2.zip
RUN unzip v11.2.zip
WORKDIR /pgbadger-11.2
RUN perl Makefile.PL
RUN make && make install
RUN mkdir -p /reports

CMD ["postgres", "-c", "logging_collector=on", "-c", "log_statement=all", "-c", "log_filename=postgresql.log", "-c", "log_directory=/var/log/postgresql"]