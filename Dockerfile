FROM quay.io/m3110w/mellowmd
RUN git clone https://github.com/DemmyJay-99/Mellow-MD.git /root/mellowmd 
WORKDIR /root/mellowmd
RUN npm install
CMD [ 'npm', 'start' ]