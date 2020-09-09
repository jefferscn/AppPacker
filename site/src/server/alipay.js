import { Project } from '../ui/model';
import Alipay from 'alipay-sdk';

function buildProjectAlipay(project) {
    return new Alipay({
        ...project.alipay,
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
        const { auth_code, app_id, scope, state } = req.body;
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
        const accessToken = result.access_token;
        const userId = result.user_id
        //对于授权，一个用户只能授权一个支付宝账号
        //所以packageKey+scope+state+userId是唯一的
        AlipayAuthRecord.deleteMany({
            packageKey: project.appId,
            scope: scope,
            state: state,
            userId: userId,
        });
        const aar = new AlipayAuthRecord();
        aar.packageKey = project.appId;
        aar.appId = app_id;
        aar.scope = scope;
        aar.state = state;
        aar.accessToken = accessToken;
        aar.userId = userId;
        aar.refreshToken = result.refresh_token;
        aar.tokenExpireTime = new Date(now + result.expires_in);
        aar.refreshTokenExpireTie = new Date(now + result.re_expires_in);
        await aar.save();
        res.json({
            result: true,
        }).end();
    }

    async function getInvoiceList(req, res) {
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
        if(!authRecord) {
            res.state(404).end();
            return;
        }
        const alipay = buildProjectAlipay(project);
        const result = await alipay.exec('alipay.ebpp.invoice.taxno.batchquery',{
            auth_token: authRecord.accessToken,
            biz_content: {
                tax_no: project.alipay.taxNo,
                invoice_kind_list: ['PLAIN','SPECIAL','PLAIN_INVOICE','PAPER_INVOICE','SALES_INVOICE'],
                secne: 'INVOICE_EXPENSE',
            }
        });
        res.json(result).end();
    }
    app.get('/alipay/:projectId/authCallback', authCallback);
    app.post('/alipay/:projectId/getInvoiceList', getInvoiceList);
}
