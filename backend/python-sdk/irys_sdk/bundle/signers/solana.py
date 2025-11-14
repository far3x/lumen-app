from typing import Any
from nacl.signing import SigningKey, VerifyKey
from nacl.exceptions import BadSignatureError
from irys_sdk.bundle.signers.signer import Signer
from irys_sdk.bundle.constants import SIG_CONFIG
import base58
import json

class SolanaSigner(Signer):
    signature_type = 4
    signature_length = SIG_CONFIG[4]['sigLength']
    owner_length = SIG_CONFIG[4]['pubLength']
    _private_key: SigningKey

    def __init__(self, private_key: str):
        try:
            key_data = json.loads(private_key)
            if len(key_data) == 64:
                seed = bytes(key_data[:32])
            elif len(key_data) == 32:
                seed = bytes(key_data)
            else:
                decoded_key = base58.b58decode(private_key)
                if len(decoded_key) == 64:
                    seed = decoded_key[:32]
                elif len(decoded_key) == 32:
                    seed = decoded_key
                else:
                    raise ValueError("Invalid private key length")

            self._private_key = SigningKey(seed)
        except Exception as e:
            raise ValueError(f"Invalid Solana private key format: {e}")

    @property
    def public_key(self) -> bytearray:
        return bytearray(self._private_key.verify_key.encode())

    def sign(self, message: bytearray, **opts: Any) -> bytearray:
        return self._private_key.sign(message).signature

    @staticmethod
    def verify(pubkey: bytearray, message: bytearray, signature: bytearray, **opts: Any) -> bool:
        try:
            verify_key = VerifyKey(bytes(pubkey))
            verify_key.verify(bytes(message), bytes(signature))
            return True
        except BadSignatureError:
            return False