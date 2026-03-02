FROM quay.io/m3110w/mellowmd:latest

WORKDIR /root/mellowmd

RUN git clone https://github.com/DemmyJay-99/Mellow-MD.git . && \
    npm install

EXPOSE 5000

CMD ["npm", "start"]