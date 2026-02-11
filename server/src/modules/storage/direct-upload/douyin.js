const crypto = require("crypto-js");
const STS = require("ali-oss").STS;
const { accessKeyId, secretAccessKey: accessKeySecret } = process.env;

const stsClient = new STS({
  // 从环境变量中获取准备工作中创建的RAM用户访问密钥。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  // 填写Bucket名称。
  bucket: "examplebucket",
});

async function getToken() {
  // 指定准备工作中创建的角色ARN，格式为acs:ram::$accountID:role/$roleName。
  const STS_ROLE = "acs:ram::137****:role/ramosstest";
  const STSpolicy = {
    Version: "1",
    Statement: [
      {
        Effect: "Allow",
        Action: "oss:PutObject",
        Resource: "acs:oss:*:*:examplebucket/*",
      },
    ],
  };
  const result = await stsClient.assumeRole(
    STS_ROLE,
    STSpolicy,
    3600 // STS过期时间，单位为秒。
  );
  const { credentials } = result;

  return credentials;
}

// 计算签名。
function computeSignature(accessKeySecret, canonicalString) {
  return crypto.enc.Base64.stringify(
    crypto.HmacSHA1(canonicalString, accessKeySecret)
  );
}
const date = new Date();
date.setHours(date.getHours() + 1);
const policyText = {
  expiration: date.toISOString(), // 设置policy过期时间。
  conditions: [
    // 限制上传大小。
    ["content-length-range", 0, 1024 * 1024 * 1024],
  ],
};

module.exports.getToken = getToken;
module.exports.policyText = policyText;
module.exports.computeSignature = computeSignature;