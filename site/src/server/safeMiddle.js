export default (fn) => {
    return async (req, res) => {
        try {
            await fn(req, res);
        } catch (ex) {
            console.log(ex);
            res.status(500).send({ message: ex });
        }
    }
}
