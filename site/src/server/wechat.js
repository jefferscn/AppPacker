import { Project } from '../ui/model';
import Wechat from '../wechat';
import md5 from 'js-md5';

function generateNonceStr() {
    return md5(new Date().toISOString());
}

async function sign(req, res) {
    const projectId = req.params.projectId;
    const project = await Project.findOne({
        appId: projectId,
    });
    console.log(req.body);
    if (!project) {
        res.state(404).end();
        return;
    }
    try {
        const config = Object.assign({
            grant_type: 'client_credential',
            nonceStr: generateNonceStr(),
        }, project.wechat);
        console.log(config);
        const result = await Wechat.sign(req.body.url, config);

        res.json(result).end();
    } catch (ex) {
        res.state(500).end();
    }
}
export default (app) => {
    app.post('/wechatsign/:projectId', sign);
}