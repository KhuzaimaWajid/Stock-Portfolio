from flask import Flask, render_template, jsonify, request
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

app = Flask(__name__)

# Store portfolio data in memory
portfolio_storage = []

# Sample portfolio data
def generate_sample_data():
    """Generate sample portfolio data for demonstration"""
    tickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']
    portfolio_data = []
    
    for ticker in tickers:
        shares = np.random.randint(10, 100)
        purchase_price = np.random.uniform(100, 500)
        current_price = purchase_price * np.random.uniform(0.8, 1.3)
        
        portfolio_data.append({
            'ticker': ticker,
            'shares': shares,
            'purchase_price': round(purchase_price, 2),
            'current_price': round(current_price, 2),
            'total_value': round(shares * current_price, 2),
            'total_cost': round(shares * purchase_price, 2),
            'gain_loss': round((current_price - purchase_price) * shares, 2),
            'return_pct': round(((current_price - purchase_price) / purchase_price) * 100, 2)
        })
    
    return portfolio_data

def calculate_position_metrics(ticker, shares, purchase_price, current_price):
    """Calculate metrics for a single position"""
    shares = float(shares)
    purchase_price = float(purchase_price)
    current_price = float(current_price)
    
    total_value = shares * current_price
    total_cost = shares * purchase_price
    gain_loss = (current_price - purchase_price) * shares
    return_pct = ((current_price - purchase_price) / purchase_price) * 100 if purchase_price > 0 else 0
    
    return {
        'ticker': ticker.upper(),
        'shares': int(shares),
        'purchase_price': round(purchase_price, 2),
        'current_price': round(current_price, 2),
        'total_value': round(total_value, 2),
        'total_cost': round(total_cost, 2),
        'gain_loss': round(gain_loss, 2),
        'return_pct': round(return_pct, 2)
    }

def generate_historical_data(ticker, days=30):
    """Generate sample historical price data"""
    dates = [(datetime.now() - timedelta(days=x)).strftime('%Y-%m-%d') for x in range(days, 0, -1)]
    base_price = np.random.uniform(100, 500)
    prices = []
    
    for i in range(len(dates)):
        price = base_price * (1 + np.random.uniform(-0.05, 0.05))
        prices.append(round(price, 2))
        base_price = price
    
    return {'dates': dates, 'prices': prices}

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('dashboard.html')

@app.route('/api/portfolio')
def get_portfolio():
    """API endpoint to get portfolio data"""
    # Use only user-entered data, never generate sample data automatically
    portfolio = portfolio_storage
    
    # Calculate portfolio summaries
    if not portfolio:
        return jsonify({
            'portfolio': [],
            'summary': {
                'total_value': 0,
                'total_cost': 0,
                'total_gain_loss': 0,
                'overall_return': 0,
                'num_positions': 0
            }
        })
    
    total_value = sum(item['total_value'] for item in portfolio)
    total_cost = sum(item['total_cost'] for item in portfolio)
    total_gain_loss = sum(item['gain_loss'] for item in portfolio)
    overall_return = round((total_gain_loss / total_cost) * 100, 2) if total_cost > 0 else 0
    
    summary = {
        'total_value': round(total_value, 2),
        'total_cost': round(total_cost, 2),
        'total_gain_loss': round(total_gain_loss, 2),
        'overall_return': overall_return,
        'num_positions': len(portfolio)
    }
    
    return jsonify({
        'portfolio': portfolio,
        'summary': summary
    })

@app.route('/api/portfolio/add', methods=['POST'])
def add_position():
    """API endpoint to add a new position"""
    data = request.json
    
    try:
        position = calculate_position_metrics(
            data['ticker'],
            data['shares'],
            data['purchase_price'],
            data['current_price']
        )
        portfolio_storage.append(position)
        return jsonify({'success': True, 'position': position})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/portfolio/update/<ticker>', methods=['PUT'])
def update_position(ticker):
    """API endpoint to update an existing position"""
    data = request.json
    
    try:
        # Find and update the position
        for i, pos in enumerate(portfolio_storage):
            if pos['ticker'].upper() == ticker.upper():
                portfolio_storage[i] = calculate_position_metrics(
                    data['ticker'],
                    data['shares'],
                    data['purchase_price'],
                    data['current_price']
                )
                return jsonify({'success': True, 'position': portfolio_storage[i]})
        
        return jsonify({'success': False, 'error': 'Position not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/portfolio/delete/<ticker>', methods=['DELETE'])
def delete_position(ticker):
    """API endpoint to delete a position"""
    global portfolio_storage
    
    portfolio_storage = [pos for pos in portfolio_storage if pos['ticker'].upper() != ticker.upper()]
    return jsonify({'success': True})

@app.route('/api/portfolio/clear', methods=['POST'])
def clear_portfolio():
    """API endpoint to clear all positions"""
    global portfolio_storage
    portfolio_storage = []
    return jsonify({'success': True})

@app.route('/api/historical/<ticker>')
def get_historical(ticker):
    """API endpoint to get historical data for a ticker"""
    days = request.args.get('days', default=30, type=int)
    data = generate_historical_data(ticker, days)
    return jsonify(data)

@app.route('/api/risk-metrics')
def get_risk_metrics():
    """API endpoint to get risk and performance statistics"""
    # Use only user-entered data, never generate sample data automatically
    portfolio = portfolio_storage
    
    if not portfolio:
        return jsonify({
            'volatility': 0,
            'sharpe_ratio': 0,
            'max_gain': 0,
            'max_loss': 0,
            'avg_return': 0,
            'positive_positions': 0,
            'negative_positions': 0
        })
    
    returns = [item['return_pct'] for item in portfolio]
    
    metrics = {
        'volatility': round(np.std(returns), 2) if len(returns) > 1 else 0,
        'sharpe_ratio': round(np.mean(returns) / np.std(returns) if np.std(returns) > 0 else 0, 2),
        'max_gain': round(max(returns), 2),
        'max_loss': round(min(returns), 2),
        'avg_return': round(np.mean(returns), 2),
        'positive_positions': sum(1 for r in returns if r > 0),
        'negative_positions': sum(1 for r in returns if r < 0)
    }
    
    return jsonify(metrics)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)