import json
import logging
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.transaction import Transaction
from solders.instruction import Instruction
from spl.token.constants import TOKEN_PROGRAM_ID
from spl.token.instructions import create_associated_token_account, get_associated_token_address, transfer as spl_transfer, TransferParams

from solana.rpc.api import Client
from solana.rpc.commitment import Confirmed
from solana.rpc.types import TxOpts
from solana.rpc.core import RPCException

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SolanaService:
    def __init__(self):
        if not all([
            settings.SOLANA_RPC_URL,
            settings.TREASURY_PRIVATE_KEY,
            settings.LUM_TOKEN_MINT_ADDRESS,
            settings.USDC_TOKEN_MINT_ADDRESS,
            settings.AIRDROP_WALLET_PRIVATE_KEY,
            settings.AIRDROP_TOKEN_MINT_ADDRESS
        ]):
            raise ValueError("Solana configuration is incomplete. Please check your environment variables.")
        
        self.client = Client(settings.SOLANA_RPC_URL)
        
        try:
            treasury_pk_bytes = bytes(json.loads(settings.TREASURY_PRIVATE_KEY))
            self.treasury_keypair = Keypair.from_bytes(treasury_pk_bytes)
            
            airdrop_pk_bytes = bytes(json.loads(settings.AIRDROP_WALLET_PRIVATE_KEY))
            self.airdrop_wallet_keypair = Keypair.from_bytes(airdrop_pk_bytes)
        except (json.JSONDecodeError, TypeError) as e:
            logger.critical(f"FATAL: Could not parse a private key. Error: {e}")
            raise ValueError("Invalid private key format. It must be a JSON array of numbers.") from e

        self.lum_mint_pubkey = Pubkey.from_string(settings.LUM_TOKEN_MINT_ADDRESS)
        self.usdc_mint_pubkey = Pubkey.from_string(settings.USDC_TOKEN_MINT_ADDRESS)
        self.airdrop_token_mint_pubkey = Pubkey.from_string(settings.AIRDROP_TOKEN_MINT_ADDRESS)

        logger.info(f"SolanaService initialized. Treasury Address: {self.treasury_keypair.pubkey()}, Airdrop Wallet: {self.airdrop_wallet_keypair.pubkey()}")

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
        
        try:
            opts = TxOpts(skip_confirmation=False, preflight_commitment=Confirmed)
            response = self.client.send_transaction(transaction, opts=opts)
            
            tx_signature = response.value
            self.client.confirm_transaction(tx_signature, commitment=Confirmed)
            
            return str(tx_signature)
        except RPCException as e:
            error_details = str(e)
            if "insufficient funds" in error_details:
                logger.error(f"Transaction failed with 'insufficient funds'. Payer: {payer_keypair.pubkey()}. This could be a lack of SOL for fees/rent or a lack of tokens in the source account.")
                raise ValueError(
                    "The transaction failed due to insufficient funds. This can mean not enough SOL for gas fees in the payer wallet, "
                    "or not enough tokens in the source token account. Please verify both balances."
                )
            else:
                logger.error(f"An unexpected RPC error occurred: {error_details}")
                raise e

    def _get_or_create_associated_token_account(self, payer_keypair: Keypair, recipient_pubkey: Pubkey, mint_pubkey: Pubkey) -> Pubkey:
        ata_address = get_associated_token_address(recipient_pubkey, mint_pubkey)
        
        try:
            account_info = self.client.get_account_info(ata_address)
            if account_info.value is not None:
                logger.info(f"Associated token account exists for {recipient_pubkey}: {ata_address}")
                return ata_address
        except Exception as e:
            logger.error(f"Error checking for ATA, proceeding with creation attempt: {e}")

        logger.info(f"Associated token account not found for {recipient_pubkey}. Creating one at {ata_address}.")
        
        instruction = create_associated_token_account(
            payer=payer_keypair.pubkey(),
            owner=recipient_pubkey,
            mint=mint_pubkey
        )
        
        try:
            tx_signature = self._send_and_confirm_tx([instruction], [payer_keypair])
            logger.info(f"Successfully created ATA. Tx: {tx_signature}")
            return ata_address
        except Exception as e:
            logger.error(f"Failed to create associated token account for {recipient_pubkey}: {e}")
            raise

    def airdrop_lumen_tokens(self, recipient_address_str: str, amount_tokens: float) -> str:
        amount_lamports = int(amount_tokens * (10**6))

        if amount_lamports <= 0:
            raise ValueError("Airdrop amount must be positive.")

        try:
            recipient_pubkey = Pubkey.from_string(recipient_address_str)
        except Exception as e:
            raise ValueError(f"Invalid recipient address: {recipient_address_str}") from e

        source_ata = get_associated_token_address(self.airdrop_wallet_keypair.pubkey(), self.airdrop_token_mint_pubkey)
        logger.info(f"Attempting to transfer from source ATA: {source_ata}")
        destination_ata = self._get_or_create_associated_token_account(self.airdrop_wallet_keypair, recipient_pubkey, self.airdrop_token_mint_pubkey)

        logger.info(f"Initiating AIRDROP LUMEN transfer of {amount_tokens} tokens to {recipient_address_str}")

        try:
            params = TransferParams(
                program_id=TOKEN_PROGRAM_ID,
                source=source_ata,
                dest=destination_ata,
                owner=self.airdrop_wallet_keypair.pubkey(),
                amount=amount_lamports
            )
            instruction = spl_transfer(params)
            tx_signature = self._send_and_confirm_tx([instruction], [self.airdrop_wallet_keypair])
            logger.info(f"Airdrop LUMEN Transfer successful. Signature: {tx_signature}")
            return tx_signature
        except Exception as e:
            logger.error(f"On-chain airdrop LUMEN transfer failed: {e}")
            raise

    def transfer_usdc_tokens(self, recipient_address_str: str, amount_usd: float) -> str:
        amount_lamports = int(amount_usd * (10**6))

        if amount_lamports <= 0:
            raise ValueError("Transfer amount must be positive.")

        try:
            recipient_pubkey = Pubkey.from_string(recipient_address_str)
        except Exception as e:
            raise ValueError(f"Invalid recipient address: {recipient_address_str}") from e

        source_ata = get_associated_token_address(self.treasury_keypair.pubkey(), self.usdc_mint_pubkey)
        destination_ata = self._get_or_create_associated_token_account(self.treasury_keypair, recipient_pubkey, self.usdc_mint_pubkey)

        logger.info(f"Initiating USDC transfer of {amount_usd} USD ({amount_lamports} lamports) to {recipient_address_str}")

        try:
            params = TransferParams(
                program_id=TOKEN_PROGRAM_ID,
                source=source_ata,
                dest=destination_ata,
                owner=self.treasury_keypair.pubkey(),
                amount=amount_lamports
            )
            
            instruction = spl_transfer(params)
            
            tx_signature = self._send_and_confirm_tx([instruction], [self.treasury_keypair])
            logger.info(f"USDC Transfer successful. Signature: {tx_signature}")
            return tx_signature
        except Exception as e:
            logger.error(f"On-chain USDC transfer failed: {e}")
            raise

solana_service = SolanaService()