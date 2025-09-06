from flask import Blueprint, request, jsonify
from utils.risk import calculate_risk
from utils.siem import push_to_siem

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('/', methods=['POST'])
def create_alert():
    data = request.json
    risk = calculate_risk(data)
    siem_response = push_to_siem(data, risk)
    return jsonify({"status": "success", "risk_score": risk, "siem_id": siem_response["id"]})
