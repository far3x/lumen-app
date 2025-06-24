import json
import logging
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.transaction import Transaction
from solders.message import Message
from solders.instruction import Instruction
from spl.token.client import Token
from spl.token.constants import TOKEN_PROGRAM_ID
from spl.token.instructions import create_associated_token_account, get_associated_token_address, transfer as spl_transfer, TransferParams

from solana.rpc.api import Client
from solana.rpc.commitment import Confirmed
from solana.rpc.types import TxOpts

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SolanaService:
    def __init__(self):
        if not all([settings.SOLANA_RPC_URL, settings.TREASURY_PRIVATE_KEY, settings.LUM_TOKEN_MINT_ADDRESS]):
            raise ValueError("Solana configuration is incomplete. Please check your environment variables.")
        
        self.client = Client(settings.SOLANA_RPC_URL)
        
        try:
            private_key_bytes = bytes(json.loads(settings.TREASURY_PRIVATE_KEY))
            self.treasury_keypair = Keypair.from_bytes(private_key_bytes)
        except (json.JSONDecodeError, TypeError) as e:
            logger.critical(f"FATAL: Could not parse TREASURY_PRIVATE_KEY. Error: {e}")
            raise ValueError("Invalid TREASURY_PRIVATE_KEY format. It must be a JSON array of numbers.") from e

        self.mint_pubkey = Pubkey.from_string(settings.LUM_TOKEN_MINT_ADDRESS)
        logger.info(f"SolanaService initialized. Treasury Address: {self.treasury_keypair.pubkey()}")

    def _send_and_confirm_tx(self, instructions: list[Instruction], signers: list[Keypair]) -> str:
        blockhash_resp = self.client.get_latest_blockhash(commitment=Confirmed)
        recent_blockhash = blockhash_resp.value.blockhash
        
        payer_keypair = signers[0]

        transaction = Transaction.new_signed_with_payer(
            instructions,
            payer_keypair.pubkey(),
            signers,
            recent_blockhash
        )

        opts = TxOpts(skip_confirmation=False, preflight_commitment=Confirmed)
        response = self.client.send_transaction(transaction, opts=opts)
        
        tx_signature = response.value
        self.client.confirm_transaction(tx_signature, commitment=Confirmed)
        
        return str(tx_signature)

    def _get_or_create_associated_token_account(self, recipient_pubkey: Pubkey) -> Pubkey:
        ata_address = get_associated_token_address(recipient_pubkey, self.mint_pubkey)
        
        try:
            account_info = self.client.get_account_info(ata_address)
            if account_info.value is not None:
                logger.info(f"Associated token account exists for {recipient_pubkey}: {ata_address}")
                return ata_address
        except Exception as e:
            logger.error(f"Error checking for ATA, proceeding with creation attempt: {e}")

        logger.info(f"Associated token account not found for {recipient_pubkey}. Creating one at {ata_address}.")
        
        instruction = create_associated_token_account(
            payer=self.treasury_keypair.pubkey(),
            owner=recipient_pubkey,
            mint=self.mint_pubkey
        )
        
        try:
            tx_signature = self._send_and_confirm_tx([instruction], [self.treasury_keypair])
            logger.info(f"Successfully created ATA. Tx: {tx_signature}")
            return ata_address
        except Exception as e:
            logger.error(f"Failed to create associated token account for {recipient_pubkey}: {e}")
            raise

    def transfer_lum_tokens(self, recipient_address_str: str, amount_lamports: int) -> str:
        if amount_lamports <= 0:
            raise ValueError("Transfer amount must be positive.")

        try:
            recipient_pubkey = Pubkey.from_string(recipient_address_str)
        except Exception as e:
            raise ValueError(f"Invalid recipient address: {recipient_address_str}") from e

        source_ata = get_associated_token_address(self.treasury_keypair.pubkey(), self.mint_pubkey)
        destination_ata = self._get_or_create_associated_token_account(recipient_pubkey)

        logger.info(f"Initiating transfer of {amount_lamports} lamports to {recipient_address_str}")

        try:
            # --- START OF FIX ---
            # The parameter name is `dest`, not `destination`. This is the final correction for this call.
            params = TransferParams(
                program_id=TOKEN_PROGRAM_ID,
                source=source_ata,
                dest=destination_ata,
                owner=self.treasury_keypair.pubkey(),
                amount=amount_lamports
            )
            
            instruction = spl_transfer(params)
            # --- END OF FIX ---
            
            tx_signature = self._send_and_confirm_tx([instruction], [self.treasury_keypair])
            logger.info(f"Transfer successful. Signature: {tx_signature}")
            return tx_signature
        except Exception as e:
            logger.error(f"On-chain transfer failed: {e}")
            raise

solana_service = SolanaService()