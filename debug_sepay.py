import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

SEPAY_API_KEY = os.getenv("SEPAY_API_KEY")
SEPAY_ACCOUNT_NUMBER = os.getenv("SEPAY_ACCOUNT_NUMBER")

async def check_sepay():
    print(f"Checking SePay for Account: {SEPAY_ACCOUNT_NUMBER}")
    url = "https://my.sepay.vn/userapi/transactions/list"
    headers = {"Authorization": f"Bearer {SEPAY_API_KEY}"}
    params = {"account_number": SEPAY_ACCOUNT_NUMBER, "limit": 20}

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers, params=params)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            transactions = data.get("transactions", [])
            print(f"Found {len(transactions)} transactions:")
            for tx in transactions:
                print(f" - ID: {tx.get('id')} | Amount: {tx.get('amount_in')} | Content: {tx.get('transaction_content')}")
                print(f"   Raw: {tx}")
        else:
            print(f"Error: {resp.text}")

if __name__ == "__main__":
    asyncio.run(check_sepay())
