import fs from "fs";
import path from "path";
import { env } from "./env";

function loadKey(keyPath: string, keyName: string): string {
  const resolvedPath = path.resolve(keyPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `${keyName} not found at: ${resolvedPath}. Run: openssl genrsa -out keys/private.pem 2048 && openssl rsa -in keys/private.pem -pubout -out keys/public.pem`,
    );
  }
  return fs.readFileSync(resolvedPath, "utf8");
}

let _privateKey: string | null = null;
let _publicKey: string | null = null;

export function getPrivateKey(): string {
  if (!_privateKey)
    _privateKey = loadKey(env.jwt.privateKeyPath, "JWT private key");
  return _privateKey;
}

export function getPublicKey(): string {
  if (!_publicKey)
    _publicKey = loadKey(env.jwt.publicKeyPath, "JWT public key");
  return _publicKey;
}
