# app.py
import json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Default conversion ranges (percentages)
BASE_RANGES = {
    "visit_to_lead": (0.10, 0.20),   # 10% - 20%
    "lead_to_interested": (0.60, 0.70),  # 60% - 70%
    "interested_to_sale": (0.20, 0.25)   # 20% - 25%
}

# Adjustment factors based on business profile
ADJUSTMENTS = {
    "B2B": {
        "high_ticket": 0.85,
        "low_ticket": 1.00,
        "hard": 0.80,
        "medium": 0.90,
        "easy": 1.00
    },
    "B2C": {
        "high_ticket": 0.95,
        "low_ticket": 1.05,
        "hard": 0.90,
        "medium": 1.00,
        "easy": 1.10
    }
}

def adjust_range(base_range, factor):
    low, high = base_range
    return (low * factor, high * factor)

def calculate_funnel(data):
    mode = data.get("mode")
    # Determine adjustment factor
    biz = data.get("business_type")  # B2B or B2C
    ticket = data.get("ticket")       # high or low
    difficulty = data.get("difficulty")  # hard, medium, easy
    factor = ADJUSTMENTS.get(biz, {}).get(ticket, 1.0) * ADJUSTMENTS.get(biz, {}).get(difficulty, 1.0)

    # Adjust conversion percentages
    visit_to_lead = adjust_range(BASE_RANGES["visit_to_lead"], factor)
    lead_to_interested = adjust_range(BASE_RANGES["lead_to_interested"], factor)
    interested_to_sale = adjust_range(BASE_RANGES["interested_to_sale"], factor)

    # Helper to compute range from a starting value
    def propagate(start_min, start_max, perc_range):
        low_perc, high_perc = perc_range
        return (start_min * low_perc, start_max * high_perc)

    result = {}
    if mode == "investment":
        # user provides investment amount; we use the historical multipliers from the reference cases
        investment = float(data.get("investment"))
        # Rough multiplier: from the two reference cases we infer reach ≈ 40 * investment (S/.)
        reach_min, reach_max = investment * 35, investment * 45
        # Clicks ≈ 2.2 * reach
        clicks_min, clicks_max = reach_min * 0.05, reach_max * 0.04  # approximate 4-5% click‑through
        # Visits based on click‑to‑visit ratio (~0.78‑0.95)
        visits_min, visits_max = clicks_min * 0.78, clicks_max * 0.95
        # Apply funnel percentages
        leads_min, leads_max = propagate(visits_min, visits_max, visit_to_lead)
        interested_min, interested_max = propagate(leads_min, leads_max, lead_to_interested)
        sales_min, sales_max = propagate(interested_min, interested_max, interested_to_sale)
        result = {
            "reach": [int(reach_min), int(reach_max)],
            "clicks": [int(clicks_min), int(clicks_max)],
            "visits": [int(visits_min), int(visits_max)],
            "leads": [int(leads_min), int(leads_max)],
            "interested": [int(interested_min), int(interested_max)],
            "sales": [int(sales_min), int(sales_max)]
        }
    else:  # mode == "sales_goal"
        target_sales = int(data.get("target_sales"))
        # Work backwards using inverse of percentages
        # First, estimate interested needed
        low_interested = target_sales / interested_to_sale[1]
        high_interested = target_sales / interested_to_sale[0]
        # Leads needed
        low_leads = low_interested / lead_to_interested[1]
        high_leads = high_interested / lead_to_interested[0]
        # Visits needed
        low_visits = low_leads / visit_to_lead[1]
        high_visits = high_leads / visit_to_lead[0]
        # Clicks (assume 85% of visits come from clicks)
        low_clicks = low_visits * 0.85
        high_clicks = high_visits * 0.85
        # Reach (assume CTR 4-5%)
        low_reach = low_clicks / 0.05
        high_reach = high_clicks / 0.04
        # Investment estimate (inverse of reach multiplier used above)
        low_inv = low_reach / 45
        high_inv = high_reach / 35
        result = {
            "investment": [int(low_inv), int(high_inv)],
            "reach": [int(low_reach), int(high_reach)],
            "clicks": [int(low_clicks), int(high_clicks)],
            "visits": [int(low_visits), int(high_visits)],
            "leads": [int(low_leads), int(high_leads)],
            "interested": [int(low_interested), int(high_interested)],
            "sales": [target_sales, target_sales]
        }
    return result

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/calculate', methods=['POST'])
def api_calculate():
    data = request.get_json()
    try:
        result = calculate_funnel(data)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
