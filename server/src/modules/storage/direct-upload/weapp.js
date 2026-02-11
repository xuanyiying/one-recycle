const express = require('express');
const OSS = require('ali-oss');
const Credential = require('@alicloud/credentials');
const { getCredential } = require('ali-oss/lib/common/signUtils');
const { getStandardRegion } = require('ali-oss/lib/common/utils/getStandardRegion');
const { policy2Str } = require('ali-oss/lib/common/utils/policy2Str');

const app = express();
const PORT = process.env.PORT || 5000; //服务请求端口号

const ECSGenerateSignature = async () => {
    //初始化ECS RAM角色凭证
    const credentialsConfig = new Credential.Config({
        type: 'ecs_ram_role',  // 固定值无需更改
        roleName: 'role_name', // 请替换为ECS扮演的角色名称
    });
    const credentialClient = new Credential.default(credentialsConfig);
    const { accessKeyId, accessKeySecret, securityToken } = await credentialClient.getCredential();

    // 初始化OSS客户端
    const client = new OSS({
        bucket: 'bucketname', // 请替换为目标Bucket名称
        region: 'cn-hangzhou', // 请替换为标Bucket所在地域
        accessKeyId,
        accessKeySecret,
        stsToken: securityToken,
        refreshSTSTokenInterval: 0,
        refreshSTSToken: async () => {
            const { accessKeyId, accessKeySecret, securityToken } = await credentialClient.getCredential();
            return { accessKeyId, accessKeySecret, stsToken: securityToken };
        },
    });
    
    // 创建表单数据Map
    const formData = new Map();

    // 设置签名过期时间为当前时间往后推10分钟 
    const date = new Date();
    const expirationDate = new Date(date);
    expirationDate.setMinutes(date.getMinutes() + 10);
    
    // 格式化日期为符合ISO 8601标准的UTC时间字符串格式
    function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }
    function formatDateToUTC(date) {
        return (
            date.getUTCFullYear() +
            padTo2Digits(date.getUTCMonth() + 1) +
            padTo2Digits(date.getUTCDate()) +
            'T' +
            padTo2Digits(date.getUTCHours()) +
            padTo2Digits(date.getUTCMinutes()) +
            padTo2Digits(date.getUTCSeconds()) +
            'Z'
        );
    }
    const formattedDate = formatDateToUTC(expirationDate);
    
    // 生成x-oss-credential并设置表单数据
    const credential = getCredential(formattedDate.split('T')[0], getStandardRegion(client.options.region), client.options.accessKeyId);
    formData.set('x_oss_date', formattedDate);
    formData.set('x_oss_credential', credential);
    formData.set('x_oss_signature_version', 'OSS4-HMAC-SHA256');

    // 创建policy
    // 示例policy表单域只列举必填字段，如有其他需求可参考签名版本4文档：https://help.aliyun.com/zh/oss/developer-reference/signature-version-4-recommend
    const policy = {
        expiration: expirationDate.toISOString(),
        conditions: [
            { 'bucket':"bucketname"}, // "bucketname"请替换为目标bucket名称
            { 'x-oss-credential': credential },
            { 'x-oss-signature-version': 'OSS4-HMAC-SHA256' },
            { 'x-oss-date': formattedDate },
        ],
    };
    
    // 如果存在STS Token，添加到策略和表单数据中
    if (client.options.stsToken) {
        policy.conditions.push({ 'x-oss-security-token': client.options.stsToken });
        formData.set('security_token', client.options.stsToken);
    }

    // 生成签名并设置表单数据
    const signature = client.signPostObjectPolicyV4(policy, date);
    formData.set('policy', Buffer.from(policy2Str(policy), 'utf8').toString('base64'));
    formData.set('signature', signature);

    // 返回表单数据
    return Object.fromEntries(formData);
};

app.get('/generate_signature', async (req, res) => {
    try {
        const result = await ECSGenerateSignature();
        res.json(result); // 返回生成的签名数据
    } catch (error) {
        console.error('Error generating signature:', error);
        res.status(500).send('Error generating signature');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});