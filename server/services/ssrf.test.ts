import test from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateIpv4, isPrivateIpv6, validateUrlForSsrf } from './ssrf.js';

test('isPrivateIpv4 correctly identifies private and reserved IP blocks', () => {
  // Loopback
  assert.equal(isPrivateIpv4('127.0.0.1'), true);
  assert.equal(isPrivateIpv4('127.12.34.56'), true);
  // 10.0.0.0/8
  assert.equal(isPrivateIpv4('10.0.0.1'), true);
  assert.equal(isPrivateIpv4('10.254.1.1'), true);
  // 172.16.0.0/12
  assert.equal(isPrivateIpv4('172.16.0.1'), true);
  assert.equal(isPrivateIpv4('172.31.255.254'), true);
  assert.equal(isPrivateIpv4('172.32.0.1'), false); // Public
  // 192.168.0.0/16
  assert.equal(isPrivateIpv4('192.168.1.1'), true);
  assert.equal(isPrivateIpv4('192.168.254.1'), true);
  // 169.254.0.0/16 Cloud Metadata
  assert.equal(isPrivateIpv4('169.254.169.254'), true);
  // Public IPs
  assert.equal(isPrivateIpv4('8.8.8.8'), false);
  assert.equal(isPrivateIpv4('1.1.1.1'), false);
  assert.equal(isPrivateIpv4('142.250.180.206'), false);
});

test('isPrivateIpv6 correctly identifies IPv6 loopback and link-local', () => {
  assert.equal(isPrivateIpv6('::1'), true);
  assert.equal(isPrivateIpv6('fe80::1'), true);
  assert.equal(isPrivateIpv6('fc00::1'), true);
  assert.equal(isPrivateIpv6('2606:4700:4700::1111'), false); // Cloudflare public
});

test('validateUrlForSsrf blocks non-http schemes and localhost', async () => {
  const fileRes = await validateUrlForSsrf('file:///etc/passwd');
  assert.equal(fileRes.valid, false);

  const ftpRes = await validateUrlForSsrf('ftp://10.0.0.1/data');
  assert.equal(ftpRes.valid, false);

  const localRes = await validateUrlForSsrf('http://localhost:3000');
  assert.equal(localRes.valid, false);

  const ipLocalRes = await validateUrlForSsrf('http://127.0.0.1:8080');
  assert.equal(ipLocalRes.valid, false);

  const metaRes = await validateUrlForSsrf('http://169.254.169.254/computeMetadata/v1/');
  assert.equal(metaRes.valid, false);
});
