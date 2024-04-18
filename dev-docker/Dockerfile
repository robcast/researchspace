FROM buildpack-deps:bullseye
WORKDIR /workdir

RUN apt update
RUN apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates openjdk-17-jdk python2

# Install Node.js v14x
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# Copy package.json and run npm install
#COPY package.json package-lock.json /workdir/
COPY package.json /workdir/
RUN npm install

# volume for node artefacts
VOLUME ["/workdir/node_modules"]

EXPOSE 3000 10214 5005

ENTRYPOINT ["/workdir/gradlew"]
CMD ["appStart"]
