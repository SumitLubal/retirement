import './RetirementChart.css'

interface RetirementChartProps {
  savings: number
  investments: number
  projectedSavings: number
  projectedInvestments: number
}

const RetirementChart = ({
  savings,
  investments,
  projectedSavings,
  projectedInvestments,
}: RetirementChartProps) => {
  const maxValue = Math.max(
    savings + investments,
    projectedSavings + projectedInvestments,
    100000
  )

  const savingsPercent = (savings / maxValue) * 100
  const investmentsPercent = (investments / maxValue) * 100
  const projectedSavingsPercent = (projectedSavings / maxValue) * 100
  const projectedInvestmentsPercent = (projectedInvestments / maxValue) * 100

  return (
    <section className="chart-section">
      <h2>Today vs Retirement</h2>
      
      <div className="chart">
        <div className="chart-bar">
          <div className="bar-label">Today</div>
          <div className="bar-container">
            {savings > 0 && (
              <div
                className="bar-segment savings"
                style={{ width: `${savingsPercent}%` }}
                title={`Savings: $${savings.toLocaleString()}`}
              />
            )}
            {investments > 0 && (
              <div
                className="bar-segment investments"
                style={{ width: `${investmentsPercent}%` }}
                title={`Investments: $${investments.toLocaleString()}`}
              />
            )}
          </div>
          <div className="bar-value">
            ${(savings + investments).toLocaleString('en-US', {maximumFractionDigits: 0})}
          </div>
        </div>

        <div className="chart-bar">
          <div className="bar-label">At Retirement</div>
          <div className="bar-container">
            {projectedSavings > 0 && (
              <div
                className="bar-segment savings"
                style={{ width: `${projectedSavingsPercent}%` }}
                title={`Projected Savings: $${projectedSavings.toLocaleString()}`}
              />
            )}
            {projectedInvestments > 0 && (
              <div
                className="bar-segment investments"
                style={{ width: `${projectedInvestmentsPercent}%` }}
                title={`Projected Investments: $${projectedInvestments.toLocaleString()}`}
              />
            )}
          </div>
          <div className="bar-value">
            ${(projectedSavings + projectedInvestments).toLocaleString('en-US', {maximumFractionDigits: 0})}
          </div>
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color savings"></div>
          <span>Savings (2% growth)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color investments"></div>
          <span>Investments (5% growth)</span>
        </div>
      </div>
    </section>
  )
}

export default RetirementChart
