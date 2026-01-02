# 📊 Portfolio Analytics Dashboard

A full-stack web application for real-time portfolio management with interactive data visualization, risk metrics, and performance analytics. Track your investments, analyze returns, and visualize your portfolio allocation with an intuitive, modern interface.

![Portfolio Analytics Dashboard](https://img.shields.io/badge/Flask-3.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Chart.js](https://img.shields.io/badge/Chart.js-4.0+-orange)

## ✨ Features

### 📈 Real-Time Portfolio Tracking
- Add, edit, and delete portfolio positions
- Automatic calculation of gains/losses and returns
- Live updates across all metrics and visualizations

### 📊 Interactive Data Visualization
- **Allocation Pie Chart**: View portfolio distribution by ticker
- **Returns Bar Chart**: Compare performance across positions
- **Historical Line Chart**: Track price movements over time

### 🎯 Risk & Performance Metrics
- **Volatility**: Measure portfolio risk
- **Sharpe Ratio**: Evaluate risk-adjusted returns
- **Max Gain/Loss**: Identify best and worst performers
- **Average Return**: Track overall portfolio performance
- **Win Rate**: Monitor winning vs. losing positions

### 💼 Portfolio Management
- User-friendly input form for adding positions
- Real-time validation and error handling
- Delete individual positions or clear entire portfolio
- Load sample data for testing

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/portfolio-analytics-dashboard.git
cd portfolio-analytics-dashboard
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Run the application**
```bash
python app.py
```

4. **Open your browser**
```
http://localhost:5000
```

## 📁 Project Structure

```
portfolio-analytics-dashboard/
│
├── app.py                      # Flask backend with API endpoints
├── requirements.txt            # Python dependencies
│
├── templates/
│   └── dashboard.html          # Main dashboard interface
│
├── static/
│   ├── css/
│   │   └── styles.css          # Dashboard styling
│   └── js/
│       └── dashboard.js        # Frontend logic & Chart.js
│
└── README.md                   # Project documentation
```

## 🔧 Technologies Used

### Backend
- **Flask** - Python web framework
- **NumPy** - Numerical calculations
- **Pandas** - Data processing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **JavaScript (ES6+)** - Interactive functionality
- **Chart.js** - Data visualization

## 📖 Usage Guide

### Adding a Position

1. Fill in the form at the top of the dashboard:
   - **Ticker Symbol**: Stock symbol (e.g., AAPL)
   - **Number of Shares**: Quantity owned
   - **Purchase Price**: Original buy price per share
   - **Current Price**: Current market price per share

2. Click **"Add Position"** button

3. The dashboard automatically updates with:
   - New position in the holdings table
   - Updated summary cards
   - Refreshed risk metrics
   - New charts reflecting the change

### Managing Positions

- **Delete**: Click the "Delete" button next to any position
- **Clear All**: Remove all positions at once
- **Load Sample Data**: Test with pre-filled demo data

### Understanding Metrics

- **Total Value**: Current market value of all holdings
- **Total Cost**: Original investment amount
- **Gain/Loss**: Absolute profit or loss ($)
- **Overall Return**: Percentage return on investment (%)
- **Volatility**: Standard deviation of returns (higher = riskier)
- **Sharpe Ratio**: Risk-adjusted return (higher = better)

## 🔌 API Endpoints

### Get Portfolio Data
```http
GET /api/portfolio
```
Returns all positions with calculated metrics and summary statistics.

**Response:**
```json
{
  "portfolio": [
    {
      "ticker": "AAPL",
      "shares": 50,
      "purchase_price": 150.00,
      "current_price": 175.50,
      "total_value": 8775.00,
      "total_cost": 7500.00,
      "gain_loss": 1275.00,
      "return_pct": 17.00
    }
  ],
  "summary": {
    "total_value": 8775.00,
    "total_cost": 7500.00,
    "total_gain_loss": 1275.00,
    "overall_return": 17.00,
    "num_positions": 1
  }
}
```

### Add Position
```http
POST /api/portfolio/add
Content-Type: application/json

{
  "ticker": "AAPL",
  "shares": 50,
  "purchase_price": 150.00,
  "current_price": 175.50
}
```

### Delete Position
```http
DELETE /api/portfolio/delete/{ticker}
```

### Clear All Positions
```http
POST /api/portfolio/clear
```

### Get Risk Metrics
```http
GET /api/risk-metrics
```

### Get Historical Data
```http
GET /api/historical/{ticker}?days=30
```

## 🎨 Customization

### Changing Colors

Edit `static/css/styles.css`:

```css
/* Main gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Positive values */
.positive { color: #28a745; }

/* Negative values */
.negative { color: #dc3545; }
```

### Adding New Metrics

1. Update calculation in `app.py`:
```python
@app.route('/api/custom-metric')
def get_custom_metric():
    # Your calculation here
    return jsonify(result)
```

2. Display in `dashboard.html`:
```html
<div class="metric-item">
    <span class="metric-label">Custom Metric:</span>
    <span class="metric-value" id="custom-metric">0</span>
</div>
```

3. Fetch in `dashboard.js`:
```javascript
async function loadCustomMetric() {
    const response = await fetch('/api/custom-metric');
    const data = await response.json();
    document.getElementById('custom-metric').textContent = data.value;
}
```

## 🔐 Data Storage

Currently, portfolio data is stored in memory and resets when the server restarts. For persistent storage, consider:

- **SQLite** for simple local persistence
- **PostgreSQL** for production deployments
- **MongoDB** for flexible document storage
- **Redis** for caching and session management

## 🚧 Future Enhancements

- [ ] User authentication and personalized portfolios
- [ ] Database integration for data persistence
- [ ] Real-time stock price API integration (Alpha Vantage, Yahoo Finance)
- [ ] Export functionality (PDF reports, CSV data)
- [ ] Advanced analytics (Monte Carlo simulations, correlation matrices)
- [ ] Mobile responsive improvements
- [ ] Dark mode toggle
- [ ] Multi-currency support
- [ ] Portfolio comparison tools
- [ ] Automated email reports
- [ ] WebSocket for real-time updates
- [ ] Transaction history tracking
- [ ] Dividend tracking
- [ ] Tax loss harvesting calculator

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in app.py
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Dependencies Not Installing
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Charts Not Displaying
- Ensure internet connection (Chart.js loads from CDN)
- Check browser console for JavaScript errors
- Clear browser cache and reload
