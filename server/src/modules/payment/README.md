# Payment Provider Module

## Overview

The Payment Provider module implements the integration with third-party payment services (WeChat Pay and Alipay) for processing withdrawal transfers. It provides a unified interface for different payment providers and handles payment callbacks.

## Architecture

```
payment-provider/
├── interfaces/
│   └── payment-provider.interface.ts    # IPaymentProvider interface
├── providers/
│   ├── wechat-pay.provider.ts          # WeChat Pay implementation
│   └── alipay.provider.ts              # Alipay implementation
├── payment-provider.factory.ts          # Factory for provider selection
├── payment-provider.module.ts           # NestJS module
└── index.ts                             # Exports
```

## Components

### IPaymentProvider Interface

Defines the contract that all payment providers must implement:

```typescript
interface IPaymentProvider {
  getProviderType(): PaymentProvider;
  transfer(amount, accountInfo, outTradeNo, description): Promise<PaymentResult>;
  queryTransfer(outTradeNo): Promise<TransferQueryResult>;
  verifyCallback(callbackData): boolean;
}
```

### WeChat Pay Provider

Implements enterprise payment to WeChat wallet (企业付款到零钱).

**Configuration Required:**
- `WECHAT_APP_ID`: WeChat application ID
- `WECHAT_TENANT_ID`: WeChat Tenant ID (Merchant ID)
- `WECHAT_API_KEY`: API key for signature
- `WECHAT_CERT_PATH`: Path to certificate file

**Features:**
- MD5 signature generation
- Real name verification (FORCE_CHECK)
- XML request/response format
- Callback signature verification

**API Documentation:**
- Transfer: https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_2
- Query: https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_3

### Alipay Provider

Implements transfer to Alipay account (转账到账户).

**Configuration Required:**
- `ALIPAY_APP_ID`: Alipay application ID
- `ALIPAY_PRIVATE_KEY`: RSA private key for signing
- `ALIPAY_PUBLIC_KEY`: Alipay public key for verification

**Features:**
- RSA2 (SHA256WithRSA) signature
- JSON request/response format
- Account name verification
- Callback signature verification

**API Documentation:**
- Transfer: https://opendocs.alipay.com/open/309/alipay.fund.trans.uni.transfer
- Query: https://opendocs.alipay.com/open/309/alipay.fund.trans.common.query

### Payment Provider Factory

Provides a centralized way to get the appropriate payment provider instance:

```typescript
const provider = paymentProviderFactory.getProvider(PaymentProvider.WECHAT);
const result = await provider.transfer(100, accountInfo, outTradeNo, description);
```

## Usage

### 1. Transfer Money

```typescript
// Get provider
const provider = this.paymentProviderFactory.getProvider(withdrawal.provider);

// Execute transfer
const result = await provider.transfer(
  100,                              // Amount in yuan
  {                                 // Account info
    openid: 'user-openid',
    realName: '张三'
  },
  'WD1697123456789abcdef',         // Unique order number
  'OneRecycle提现'                  // Description
);

if (result.success) {
  console.log('Transfer successful:', result.transactionId);
} else {
  console.error('Transfer failed:', result.message);
}
```

### 2. Query Transfer Status

```typescript
const status = await provider.queryTransfer('WD1697123456789abcdef');

switch (status.status) {
  case TransferStatus.SUCCESS:
    // Handle success
    break;
  case TransferStatus.PROCESSING:
    // Still processing
    break;
  case TransferStatus.FAILED:
    // Handle failure
    break;
}
```

### 3. Verify Callback

```typescript
const isValid = provider.verifyCallback(callbackData);

if (!isValid) {
  throw new PaymentCallbackVerificationException();
}

// Process callback data
```

## Development Mode

In development environment (`NODE_ENV=development`), the providers simulate successful transfers without calling actual payment APIs. This allows testing without real payment credentials.

```typescript
// Development mode response
{
  success: true,
  transactionId: 'WX1697123456789',
  message: '转账成功'
}
```

## Production Implementation

For production use, you need to:

1. **Install HTTP client library** (e.g., axios)
2. **Configure HTTPS agent** with certificates (for WeChat Pay)
3. **Implement actual API calls** in the transfer and query methods
4. **Handle API responses** and error codes
5. **Set up callback URLs** in payment provider dashboards

### Example Production Implementation

```typescript
// WeChat Pay transfer (production)
const response = await this.httpClient.post(
  `${this.apiUrl}/mmpaymkttransfers/promotion/transfers`,
  this.buildXml(requestData),
  {
    httpsAgent: new https.Agent({
      cert: fs.readFileSync(this.certPath),
      key: fs.readFileSync(this.keyPath),
    })
  }
);

// Parse XML response
const result = await this.parseXmlResponse(response.data);

if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
  return {
    success: true,
    transactionId: result.payment_no,
  };
}
```

## Security Considerations

### 1. Signature Verification
- All callbacks must be verified using the provider's signature algorithm
- Reject callbacks with invalid signatures immediately

### 2. Idempotency
- Use unique `outTradeNo` for each transfer
- Check for duplicate callbacks before processing

### 3. Credential Management
- Store API keys and certificates securely (environment variables)
- Never commit credentials to version control
- Rotate keys regularly

### 4. HTTPS Communication
- Always use HTTPS for API calls
- Verify SSL certificates
- Use certificate pinning for critical operations

### 5. Amount Validation
- Validate amounts before transfer
- Use decimal precision for financial calculations
- Check minimum/maximum limits

## Error Handling

### Common Errors

1. **Invalid Account Info**
   - Missing required fields (openid, realName, etc.)
   - Invalid account format

2. **Insufficient Balance**
   - Merchant account has insufficient funds
   - User account frozen

3. **Network Errors**
   - Timeout
   - Connection refused
   - DNS resolution failure

4. **API Errors**
   - Invalid signature
   - Invalid parameters
   - Rate limit exceeded

### Error Response Format

```typescript
{
  success: false,
  message: 'Error description',
  errorCode: 'ERROR_CODE'
}
```

## Testing

### Unit Tests

Test each provider independently:

```typescript
describe('WeChatPayProvider', () => {
  it('should generate correct signature', () => {
    const sign = provider.generateSign(params);
    expect(sign).toBe(expectedSign);
  });

  it('should verify callback signature', () => {
    const isValid = provider.verifyCallback(callbackData);
    expect(isValid).toBe(true);
  });
});
```

### Integration Tests

Test with payment provider sandbox environments:

```typescript
describe('Payment Integration', () => {
  it('should complete transfer flow', async () => {
    const result = await provider.transfer(...);
    expect(result.success).toBe(true);

    const status = await provider.queryTransfer(outTradeNo);
    expect(status.status).toBe(TransferStatus.SUCCESS);
  });
});
```

## Monitoring

### Metrics to Track

1. **Transfer Success Rate**
   - Successful transfers / Total transfers
   - Track by provider

2. **Transfer Duration**
   - Time from initiation to completion
   - P50, P95, P99 percentiles

3. **Callback Processing Time**
   - Time to process and verify callbacks

4. **Error Rates**
   - By error type and provider
   - Alert on sudden increases

### Logging

Log all payment operations:

```typescript
this.logger.log(`WeChat transfer: ${outTradeNo}, amount: ${amount}`);
this.logger.error(`Transfer failed: ${error.message}`, error.stack);
```

## Future Enhancements

1. **Additional Providers**
   - Bank transfer
   - Other payment platforms

2. **Batch Transfers**
   - Process multiple withdrawals in one API call
   - Reduce API costs

3. **Automatic Retry**
   - Retry failed transfers with exponential backoff
   - Handle transient errors

4. **Rate Limiting**
   - Implement rate limiting per provider
   - Queue transfers during high load

5. **Webhook Management**
   - Automatic webhook registration
   - Webhook health monitoring
