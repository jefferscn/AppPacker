import { Project } from '../ui/model';
import Alipay from 'alipay-sdk';

function buildProjectAlipay(project) {
    return new Alipay({
        appId: project.alipay.appId,
        privateKey: project.alipay.appPrivateKey,
        encryptKey: project.alipay.encryptKey,
        //gateway: 'https://openapi.alipaydev.com/gateway.do',
    });
}
export default (app) => {
    const mongoose = app.mongoose;
    const AlipayAuthSchema = new mongoose.Schema({
        packageKey: String,
        appId: String,
        scope: String,
        state: String,
        accessToken: String,
        userId: String,
        refreshToken: String,
        tokenExpireTime: Date,
        refreshTokenExpireTime: Date,
    });
    const AlipayAuthRecord = mongoose.model('AlipayAuth', AlipayAuthSchema);
    async function authCallback(req, res) {//这里需要返回一个页面
        const projectId = req.params.projectId;
        const { auth_code, app_id, scope, state } = req.query;
        console.log(req.query);
        const project = await Project.findOne({
            appId: projectId,
        });
        if (!project) {
            res.state(404).end();
            return;
        }
        const alipay = buildProjectAlipay(project);
        const now = Date.now();
        const result = await alipay.exec('alipay.system.oauth.token', {
            grantType: 'authorization_code',
            code: auth_code,
        });
        console.log(result);
        const accessToken = result.accessToken;
        const userId = result.userId
        //对于授权，一个用户只能授权一个支付宝账号
        //所以packageKey+scope+state+userId是唯一的
        const tmp = await AlipayAuthRecord.deleteMany({
            packageKey: project.appId,
            scope: scope,
            state: state,
            userId: userId,
        });
        console.log(tmp);
        const aar = new AlipayAuthRecord();
        aar.packageKey = project.appId;
        aar.appId = app_id;
        aar.scope = scope;
        aar.state = state;
        aar.accessToken = accessToken;
        aar.userId = userId;
        aar.refreshToken = result.refreshToken;
        aar.tokenExpireTime = new Date(now + result.expiresIn);
        aar.refreshTokenExpireTie = new Date(now + result.reExpiresIn);
        await aar.save();
        res.json({
            result: true,
        }).end();
    }

    async function checkValid(req, res) {
        const projectId = req.params.projectId;
        const yigoUserId = req.body.userId;
        const project = await Project.findOne({
            appId: projectId,
        });
        if (!project) {
            res.state(404).end();
            return;
        }
        const authRecord = await AlipayAuthRecord.findOne({
            packageKey: project.appId,
            state: yigoUserId,
        });
        if(authRecord) {
            res.json({result: true}).end();
            return;
        }
        res.json({result: false}).end();
    }

    async function getInvoiceList(req, res) {
        const projectId = req.params.projectId;
        const yigoUserId = req.body.userId;
        const { startDate, endDate } = req.body;
        const limit = req.body.limit || 20;
        const page = req.body.page || 1;
        const project = await Project.findOne({
            appId: projectId,
        });
        if (!project) {
            res.state(404).end();
            return;
        }
        console.log(req.body);
        const authRecord = await AlipayAuthRecord.findOne({
            packageKey: project.appId,
            state: yigoUserId,
        });
        if(!authRecord) {
            res.state(404).end();
            return;
        }
        const alipay = buildProjectAlipay(project);
        const result = await alipay.exec('alipay.ebpp.invoice.taxno.batchquery',{
            authToken: authRecord.accessToken,
            bizContent: {
                taxNo: project.alipay.taxNo,
                invoiceKindList: ['PLAIN'],
                scene: 'INVOICE_EXPENSE',
                start_invoice_date: startDate,
                end_invoice_date: endDate,
                limit_size: limit,
                page_num: page,
            }
        });
        res.json(result).end();
    }
    app.get('/alipay/:projectId/authCallback', authCallback);
    app.post('/alipay/:projectId/checkValid', checkValid);
    app.post('/alipay/:projectId/getInvoiceList', getInvoiceList);
}
