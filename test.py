import httpx
import asyncio

SEPAY_API_KEY = "JEHFTDRFGUQHAVKIZLTO6SGJSJFYRZRQ0BF9OENDLU6UCBOKVK8MYUQXGPEB93WJ"
SEPAY_ACCOUNT_NUMBER = "108880567389"

async def test():
    url = "https://my.sepay.vn/userapi/transactions/list"
    headers = {"Authorization": f"Bearer {SEPAY_API_KEY}"}
    params = {"account_number": SEPAY_ACCOUNT_NUMBER, "limit": 20}

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers, params=params)
        print("Status:", resp.status_code)
        print(resp.text)

asyncio.run(test())