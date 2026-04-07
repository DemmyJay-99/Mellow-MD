const normaliseLid = async (sock, lid) => {
    const store = sock.signalRepository.lidMapping;
    const pn = await store.getPNForLID(lid);
    return pn.split(":")[0];
}

export default normaliseLid;