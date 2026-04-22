#!/usr/bin/env python3
"""
Tencent Cloud DNSPod API Client
Implements proper TC3-HMAC-SHA256 signature for API authentication
"""

import sys
import json
import hmac
import hashlib
import datetime
import socket
import urllib.request
import urllib.error


class DNSPodClient:
    def __init__(self, secret_id: str, secret_key: str, domain: str):
        self.secret_id = secret_id
        self.secret_key = secret_key
        self.domain = domain
        self.endpoint = "dnspod.tencentcloudapi.com"
        self.service = "dnspod"
        self.version = "2021-03-23"
        self.region = ""
        self.timeout = 30

    def _sha256_hex(self, data: str) -> str:
        return hashlib.sha256(data.encode('utf-8')).hexdigest()

    def _hmac_sha256(self, key: bytes, data: str) -> bytes:
        return hmac.new(key, data.encode('utf-8'), hashlib.sha256).digest()

    def _sign(self, secret_key: str, date: str, service: str, string_to_sign: str) -> str:
        signature = self._hmac_sha256(
            ("TC3-" + secret_key).encode('utf-8'),
            date
        )
        signature = self._hmac_sha256(signature, service)
        signature = self._hmac_sha256(signature, "tc3_request")
        signature = hmac.new(
            signature,
            string_to_sign.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature

    def _do_sign(self, payload: str, timestamp: int) -> tuple:
        http_request_method = "POST"
        canonical_uri = "/"
        canonical_query_string = ""
        canonical_headers = f"content-type:application/json\nhost:{self.endpoint}\n"
        signed_headers = "content-type;host"

        hashed_request_payload = self._sha256_hex(payload)

        canonical_request = (
            f"{http_request_method}\n"
            f"{canonical_uri}\n"
            f"{canonical_query_string}\n"
            f"{canonical_headers}\n"
            f"{signed_headers}\n"
            f"{hashed_request_payload}"
        )

        date = datetime.datetime.fromtimestamp(timestamp, tz=datetime.timezone.utc).strftime("%Y-%m-%d")
        credential_scope = f"{date}/{self.service}/tc3_request"
        hashed_canonical_request = self._sha256_hex(canonical_request)

        string_to_sign = (
            "TC3-HMAC-SHA256\n"
            f"{timestamp}\n"
            f"{credential_scope}\n"
            f"{hashed_canonical_request}"
        )

        signature = self._sign(self.secret_key, date, self.service, string_to_sign)

        authorization = (
            f"TC3-HMAC-SHA256 "
            f"Credential={self.secret_id}/{credential_scope}, "
            f"SignedHeaders={signed_headers}, "
            f"Signature={signature}"
        )

        return authorization, hashed_request_payload

    def create_txt_record(self, subdomain: str, value: str, ttl: int = 300) -> dict:
        params = {
            "Domain": self.domain,
            "SubDomain": subdomain,
            "RecordType": "TXT",
            "RecordLine": "默认",
            "Value": value,
            "TTL": ttl
        }
        return self._api_call("CreateRecord", params)

    def delete_record(self, record_id: int) -> dict:
        params = {
            "Domain": self.domain,
            "Id": record_id
        }
        return self._api_call("DeleteRecord", params)

    def describe_records(self, subdomain: str = "", record_type: str = "TXT") -> dict:
        params = {"Domain": self.domain}
        if subdomain:
            params["SubDomain"] = subdomain
        if record_type:
            params["RecordType"] = record_type
        return self._api_call("DescribeRecordList", params)

    def _api_call(self, action: str, params: dict) -> dict:
        timestamp = int(datetime.datetime.now().timestamp())

        payload = json.dumps(params, ensure_ascii=False)
        authorization, _ = self._do_sign(payload, timestamp)

        headers = {
            "Content-Type": "application/json",
            "Host": self.endpoint,
            "Authorization": authorization,
            "X-TC-Action": action,
            "X-TC-Timestamp": str(timestamp),
            "X-TC-Version": self.version,
            "X-TC-Region": self.region
        }

        url = f"https://{self.endpoint}/"

        try:
            req = urllib.request.Request(
                url,
                data=payload.encode('utf-8'),
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                raw_body = response.read().decode('utf-8')
                result = json.loads(raw_body)

                if "Response" in result and "Error" in result["Response"]:
                    error_info = result["Response"]["Error"]
                    return {
                        "error": {
                            "code": error_info.get("Code", "UNKNOWN"),
                            "message": error_info.get("Message", "Unknown API error"),
                            "request_id": result["Response"].get("RequestId", "")
                        }
                    }

                return result

        except urllib.error.HTTPError as e:
            try:
                error_body = e.read().decode('utf-8') if e.fp else ""
            except Exception:
                error_body = ""
            return {"error": {"code": e.code, "message": f"HTTP {e.code}: {str(e)}", "body": error_body}}

        except urllib.error.URLError as e:
            if hasattr(e, 'reason') and isinstance(e.reason, socket.timeout):
                return {"error": {"code": -2, "message": f"Request timed out after {self.timeout}s"}}
            return {"error": {"code": -3, "message": f"Connection failed: {str(e.reason) if hasattr(e, 'reason') else str(e)}"}}

        except socket.timeout:
            return {"error": {"code": -2, "message": f"Socket timeout after {self.timeout}s"}}

        except json.JSONDecodeError as e:
            return {"error": {"code": -4, "message": f"Invalid JSON response: {str(e)}"}}

        except ValueError as e:
            return {"error": {"code": -5, "message": f"Value error: {str(e)}"}}

        except Exception as e:
            return {"error": {"code": -1, "message": f"Unexpected error: {type(e).__name__}: {str(e)}"}}

    def get_record_id_by_challenge(self, challenge_token: str) -> int:
        try:
            result = self.describe_records(subdomain="_acme-challenge")
            if "error" in result:
                print(f"[DNSPod] API error while finding record: {result['error']}", file=sys.stderr)
                return -1
            if "Response" in result and "RecordList" in result["Response"]:
                for record in result["Response"]["RecordList"]:
                    if record.get("Value") == challenge_token:
                        return int(record["Id"])
            return -1
        except Exception as e:
            print(f"Error finding record: {e}", file=sys.stderr)
            return -1


def main():
    import os

    action = sys.argv[1] if len(sys.argv) > 1 else ""
    secret_id = os.environ.get("TENCENT_CLOUD_SECRET_ID", "")
    secret_key = os.environ.get("TENCENT_CLOUD_SECRET_KEY", "")
    domain = os.environ.get("DOMAIN", "backbuy.cn")

    if not secret_id or not secret_key:
        print("Error: TENCENT_CLOUD_SECRET_ID or TENCENT_CLOUD_SECRET_KEY not set", file=sys.stderr)
        sys.exit(1)

    client = DNSPodClient(secret_id, secret_key, domain)

    if action == "create":
        subdomain = sys.argv[2] if len(sys.argv) > 2 else "_acme-challenge"
        value = sys.argv[3] if len(sys.argv) > 3 else ""

        if not value:
            print("Error: challenge value not provided", file=sys.stderr)
            sys.exit(1)

        result = client.create_txt_record(subdomain, value)

        if "Response" in result and "RecordId" in result["Response"]:
            print(result["Response"]["RecordId"])
            sys.exit(0)
        else:
            print(json.dumps(result, ensure_ascii=False), file=sys.stderr)
            sys.exit(1)

    elif action == "delete":
        record_id = sys.argv[2] if len(sys.argv) > 2 else ""

        if not record_id:
            print("Error: record_id not provided", file=sys.stderr)
            sys.exit(1)

        result = client.delete_record(int(record_id))

        if "Response" in result:
            print("Deleted successfully")
            sys.exit(0)
        else:
            print(json.dumps(result, ensure_ascii=False), file=sys.stderr)
            sys.exit(1)

    elif action == "find":
        challenge_token = sys.argv[2] if len(sys.argv) > 2 else ""

        if not challenge_token:
            print("Error: challenge token not provided", file=sys.stderr)
            sys.exit(1)

        record_id = client.get_record_id_by_challenge(challenge_token)

        if record_id > 0:
            print(record_id)
            sys.exit(0)
        else:
            print("Record not found", file=sys.stderr)
            sys.exit(1)

    else:
        print(f"Usage: {sys.argv[0]} <create|delete|find> [args]", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
