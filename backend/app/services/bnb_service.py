import json
import logging
from decimal import Decimal
from web3 import Web3
from web3.middleware import geth_poa_middleware
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Minimal ERC20 ABI for the transfer function
MINIMAL_ERC20_ABI = json.loads('[{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}]')

class BNBService:
    def __init__(self):
        if not all([settings.BNB_RPC_URL, settings.AIRDROP_HOT_WALLET_PRIVATE_KEY, settings.AIRDROP_TOKEN_CONTRACT_ADDRESS]):
            raise ValueError("BNB airdrop configuration is incomplete.")

        self.web3 = Web3(Web3.HTTPProvider(settings.BNB_RPC_URL))
        self.web3.middleware_onion.inject(geth_poa_middleware, layer=0) # For BSC compatibility

        if not self.web3.is_connected():
            raise ConnectionError("Failed to connect to BNB RPC.")

        self.hot_wallet_private_key = settings.AIRDROP_HOT_WALLET_PRIVATE_KEY
        self.hot_wallet_address = self.web3.eth.account.from_key(self.hot_wallet_private_key).address
        
        self.token_address = self.web3.to_checksum_address(settings.AIRDROP_TOKEN_CONTRACT_ADDRESS)
        self.token_contract = self.web3.eth.contract(address=self.token_address, abi=MINIMAL_ERC20_ABI)
        
        logger.info(f"BNBService initialized. Hot wallet: {self.hot_wallet_address}")

    def transfer_tokens(self, recipient_address_str: str, amount: Decimal) -> str:
        try:
            recipient_address = self.web3.to_checksum_address(recipient_address_str)
            # Assuming the token has 18 decimals, which is standard
            amount_in_wei = int(amount * (10**18))

            if amount_in_wei <= 0:
                raise ValueError("Transfer amount must be positive.")

            logger.info(f"Initiating BNB token transfer of {amount} to {recipient_address}")

            nonce = self.web3.eth.get_transaction_count(self.hot_wallet_address)
            
            tx = self.token_contract.functions.transfer(recipient_address, amount_in_wei).build_transaction({
                'chainId': self.web3.eth.chain_id,
                'gas': 200000, 
                'gasPrice': self.web3.eth.gas_price,
                'nonce': nonce,
            })

            signed_tx = self.web3.eth.account.sign_transaction(tx, private_key=self.hot_wallet_private_key)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            logger.info(f"Transaction sent. Hash: {tx_hash.hex()}. Waiting for receipt...")
            
            tx_receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

            if tx_receipt.status != 1:
                raise Exception(f"Transaction failed. Receipt: {tx_receipt}")

            logger.info(f"BNB Token transfer successful. Hash: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            logger.error(f"On-chain BNB token transfer failed: {e}", exc_info=True)
            raise

bnb_service = BNBService()