FROM quay.io/m3110w/mellowmd:latest

WORKDIR /root/mellowmd

RUN git clone https://github.com/DemmyJay-99/Mellow-MD.git . && \
    yarn install --frozen-lockfile

EXPOSE 5000

CMD ["npm", "start"]