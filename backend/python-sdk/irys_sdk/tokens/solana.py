from __future__ import annotations
from typing import Any
from irys_sdk.bundle.signers.solana import SolanaSigner
from irys_sdk.tokens.base import BaseToken
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import TransferParams, transfer
from solders.transaction import Transaction
from solana.rpc.api import Client
from solana.rpc.commitment import Finalized
import json

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from irys_sdk.client import Uploader

class SolanaToken(BaseToken):
    irys: "Uploader"
    _provider_instance: Client = None
    name = "solana"
    ticker = "SOL"
    base = ("lamports", 1_000_000_000)

    def __init__(self, irys: "Uploader", **kwargs):
        self.irys = irys
        self.provider_url = kwargs.get("provider_url")
        if not self.provider_url:
            raise ValueError("Solana RPC URL is required for SolanaToken.")
        
        self._wallet = kwargs.get("wallet")
        if not self._wallet:
            raise ValueError("Missing required wallet private key.")
        
        try:
            key_data = json.loads(self._wallet)
            if len(key_data) not in [32, 64]:
                 raise ValueError("Invalid key length")
            self._keypair = Keypair.from_bytes(key_data)
        except Exception as e:
            raise ValueError(f"Invalid Solana private key format: {e}")


    def get_provider(self) -> Client:
        if self._provider_instance is None:
            self._provider_instance = Client(self.provider_url)
        return self._provider_instance

    def get_public_key(self) -> bytes:
        return self._keypair.pubkey().__bytes__()

    def get_signer(self) -> SolanaSigner:
        return SolanaSigner(self._wallet)

    def get_tx(self, tx_id: str):
        provider = self.get_provider()
        return provider.get_transaction(tx_id, commitment=Finalized, max_supported_transaction_version=0)

    def owner_to_address(self, pub: bytes) -> str:
        return Pubkey.from_bytes(pub).__str__()

    def ready(self):
        self.address = self._keypair.pubkey().__str__()

    def create_tx(self, amount: int, to: str, fee=None):
        provider = self.get_provider()
        
        ix = transfer(
            TransferParams(
                from_pubkey=self._keypair.pubkey(),
                to_pubkey=Pubkey.from_string(to),
                lamports=amount
            )
        )
        
        latest_blockhash = provider.get_latest_blockhash(commitment=Finalized).value
        
        tx = Transaction.new_signed_with_payer(
            [ix],
            self._keypair.pubkey(),
            [self._keypair],
            latest_blockhash.blockhash
        )
        
        return tx

    def send_tx(self, tx: Any) -> Any:
        provider = self.get_provider()
        res = provider.send_raw_transaction(tx.serialize())
        return res.value.__str__()