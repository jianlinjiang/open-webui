/*
Copyright (c) 2025 Alibaba Cloud

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


import axios from 'axios';
import jsonwebtoken from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { jwtDecode } from 'jwt-decode';

// const ATTEST_SERVICE_ENDPOINT = "https://confidentialcomputing-dev.aizelnetwork.com/attestation";
const ATTEST_SERVICE_ENDPOINT = '/attestation-api/attestation';

export async function attest(attestResult) {
	const evidence = {
		"quote": attestResult.quote,
		"container_eventlog": attestResult.container_eventlog,
		"cc_eventlog": attestResult.cc_eventlog,
	};

	// base64 encode evidence with URL safe characters without padding
	const evidencebase64 = Buffer.from(JSON.stringify(evidence)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

	const req = {
		// empty policy_ids means only check the cryptographic integrity of the evidence
		"tee": "tdx",
		"evidence": evidencebase64,
	}

	const request_body = {
		verification_requests : [req],
		policy_ids: []
	}
	const response = await axios.post(ATTEST_SERVICE_ENDPOINT, request_body);

	return response.data;
}

export async function decode_apprasial_token(token) {
	const decoded = jwtDecode(token);

	return decoded;
}

export async function verify_apprasial_token(token) {
	const client = jwksClient({
		jwksUri: 'https://confidentialcomputing-dev.aizelnetwork.com/api/jwks',
	});
	const key = await client.getSigningKey();
	const publicKey = key.getPublicKey();

	const decoded = jsonwebtoken.verify(token, publicKey);

	return decoded;
}


