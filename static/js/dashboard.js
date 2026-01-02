// Global variables for charts
let allocationChart = null;
let returnsChart = null;
let historicalChart = null;
let portfolioData = null;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPortfolioData();
    loadRiskMetrics();
    setupFormHandler();
});

// Setup form submission handler
function setupFormHandler() {
    const form = document.getElementById('add-position-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const ticker = document.getElementById('ticker-input').value;
        const shares = document.getElementById('shares-input').value;
        const purchasePrice = document.getElementById('purchase-price-input').value;
        const currentPrice = document.getElementById('current-price-input').value;
        
        await addPosition(ticker, shares, purchasePrice, currentPrice);
        
        // Clear form
        form.reset();
    });
}

// Add a new position
async function addPosition(ticker, shares, purchasePrice, currentPrice) {
    try {
        const response = await fetch('/api/portfolio/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticker: ticker,
                shares: shares,
                purchase_price: purchasePrice,
                current_price: currentPrice
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Reload all data
            await loadPortfolioData();
            await loadRiskMetrics();
            alert(`✓ ${ticker} added successfully!`);
        } else {
            alert('Error adding position: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding position:', error);
        alert('Error adding position. Please try again.');
    }
}

// Delete a position
async function deletePosition(ticker) {
    if (!confirm(`Are you sure you want to delete ${ticker}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/portfolio/delete/${ticker}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadPortfolioData();
            await loadRiskMetrics();
        } else {
            alert('Error deleting position');
        }
    } catch (error) {
        console.error('Error deleting position:', error);
    }
}

// Clear all positions
async function clearAllPositions() {
    if (!confirm('Are you sure you want to clear ALL positions? This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/portfolio/clear', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadPortfolioData();
            await loadRiskMetrics();
            alert('✓ All positions cleared!');
        }
    } catch (error) {
        console.error('Error clearing positions:', error);
    }
}

// Load sample data (for demo purposes)
async function loadSampleData() {
    const samplePositions = [
        { ticker: 'AAPL', shares: 50, purchase_price: 150.00, current_price: 175.50 },
        { ticker: 'GOOGL', shares: 25, purchase_price: 2800.00, current_price: 2950.00 },
        { ticker: 'MSFT', shares: 40, purchase_price: 300.00, current_price: 325.00 },
        { ticker: 'AMZN', shares: 30, purchase_price: 3200.00, current_price: 3400.00 },
        { ticker: 'TSLA', shares: 20, purchase_price: 700.00, current_price: 650.00 }
    ];
    
    // Clear existing positions first
    await fetch('/api/portfolio/clear', { method: 'POST' });
    
    // Add sample positions
    for (const pos of samplePositions) {
        await fetch('/api/portfolio/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pos)
        });
    }
    
    await loadPortfolioData();
    await loadRiskMetrics();
    alert('✓ Sample data loaded!');
}

// Load portfolio data from API
async function loadPortfolioData() {
    try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        portfolioData = data;
        
        updateSummaryCards(data.summary);
        populatePortfolioTable(data.portfolio);
        createAllocationChart(data.portfolio);
        createReturnsChart(data.portfolio);
        populateTickerSelector(data.portfolio);
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

// Load risk metrics from API
async function loadRiskMetrics() {
    try {
        const response = await fetch('/api/risk-metrics');
        const metrics = await response.json();
        
        document.getElementById('volatility').textContent = metrics.volatility;
        document.getElementById('sharpe-ratio').textContent = metrics.sharpe_ratio;
        document.getElementById('max-gain').textContent = metrics.max_gain + '%';
        document.getElementById('max-loss').textContent = metrics.max_loss + '%';
        document.getElementById('avg-return').textContent = metrics.avg_return + '%';
        document.getElementById('positive-positions').textContent = 
            `${metrics.positive_positions} / ${metrics.positive_positions + metrics.negative_positions}`;
    } catch (error) {
        console.error('Error loading risk metrics:', error);
    }
}

// Update summary cards
function updateSummaryCards(summary) {
    document.getElementById('total-value').textContent = '$' + summary.total_value.toLocaleString();
    document.getElementById('total-cost').textContent = '$' + summary.total_cost.toLocaleString();
    
    const gainLossElement = document.getElementById('gain-loss');
    gainLossElement.textContent = '$' + summary.total_gain_loss.toLocaleString();
    gainLossElement.className = 'value ' + (summary.total_gain_loss >= 0 ? 'positive' : 'negative');
    
    const returnElement = document.getElementById('overall-return');
    returnElement.textContent = summary.overall_return + '%';
    returnElement.className = 'value ' + (summary.overall_return >= 0 ? 'positive' : 'negative');
}

// Populate portfolio table
function populatePortfolioTable(portfolio) {
    const tbody = document.getElementById('portfolio-tbody');
    tbody.innerHTML = '';
    
    if (portfolio.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" style="text-align: center; padding: 30px; color: #999;">No positions added yet. Use the form above to add your first position!</td>';
        tbody.appendChild(row);
        return;
    }
    
    portfolio.forEach(item => {
        const row = document.createElement('tr');
        
        const returnClass = item.return_pct >= 0 ? 'positive' : 'negative';
        const gainLossClass = item.gain_loss >= 0 ? 'positive' : 'negative';
        
        row.innerHTML = `
            <td><strong>${item.ticker}</strong></td>
            <td>${item.shares}</td>
            <td>$${item.purchase_price.toFixed(2)}</td>
            <td>$${item.current_price.toFixed(2)}</td>
            <td>$${item.total_value.toLocaleString()}</td>
            <td>$${item.total_cost.toLocaleString()}</td>
            <td class="${gainLossClass}">$${item.gain_loss.toLocaleString()}</td>
            <td class="${returnClass}">${item.return_pct}%</td>
            <td><button class="delete-btn" onclick="deletePosition('${item.ticker}')">Delete</button></td>
        `;
        
        tbody.appendChild(row);
    });
}

// Create allocation pie chart
function createAllocationChart(portfolio) {
    const ctx = document.getElementById('allocation-chart').getContext('2d');
    
    if (allocationChart) {
        allocationChart.destroy();
    }
    
    // Handle empty portfolio
    if (portfolio.length === 0) {
        allocationChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['No Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e0e0e0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
        return;
    }
    
    const labels = portfolio.map(item => item.ticker);
    const data = portfolio.map(item => item.total_value);
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#43e97b', '#fa709a', '#fee140', '#30cfd0'
    ];
    
    allocationChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create returns bar chart
function createReturnsChart(portfolio) {
    const ctx = document.getElementById('returns-chart').getContext('2d');
    
    if (returnsChart) {
        returnsChart.destroy();
    }
    
    // Handle empty portfolio
    if (portfolio.length === 0) {
        returnsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Return %',
                    data: [0],
                    backgroundColor: ['#e0e0e0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
        return;
    }
    
    const labels = portfolio.map(item => item.ticker);
    const data = portfolio.map(item => item.return_pct);
    const colors = data.map(val => val >= 0 ? '#28a745' : '#dc3545');
    
    returnsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Return %',
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Return: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Populate ticker selector
function populateTickerSelector(portfolio) {
    const select = document.getElementById('ticker-select');
    select.innerHTML = '<option value="">-- Select --</option>';
    
    portfolio.forEach(item => {
        const option = document.createElement('option');
        option.value = item.ticker;
        option.textContent = item.ticker;
        select.appendChild(option);
    });
    
    select.addEventListener('change', function() {
        if (this.value) {
            loadHistoricalData(this.value);
        }
    });
}

// Load historical data for selected ticker
async function loadHistoricalData(ticker) {
    try {
        const response = await fetch(`/api/historical/${ticker}?days=30`);
        const data = await response.json();
        
        createHistoricalChart(ticker, data);
    } catch (error) {
        console.error('Error loading historical data:', error);
    }
}

// Create historical line chart
function createHistoricalChart(ticker, data) {
    const ctx = document.getElementById('historical-chart').getContext('2d');
    
    if (historicalChart) {
        historicalChart.destroy();
    }
    
    historicalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: `${ticker} Price`,
                data: data.prices,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Price: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}