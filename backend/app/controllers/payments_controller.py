# backend/app/controllers/payments_controller.py
async def process_payment(user_id: str, amount: float):
    # TODO: Integrate Pi network payments
    return {"user_id": user_id, "amount": amount, "status": "success"}
