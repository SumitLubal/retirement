import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import './GrowthProjection.css'

interface GrowthProjectionProps {
  currentSavings: number
  currentInvestments: number
  monthlyContributionsSavings?: number
  monthlyContributionsInvestment?: number
  retirementAge: number
  currentAge: number
  investmentRate?: number
  savingsRate?: number
  withdrawalRate?: number
  projectedAtRetirement?: number
  viewAge?: number
  onViewAgeChange?: (age: number) => void
}

const GrowthProjection = ({
  currentSavings,
  currentInvestments,
  monthlyContributionsSavings = 0,
  monthlyContributionsInvestment = 0,
  retirementAge,
  currentAge,
  investmentRate = 5,
  savingsRate = 2,
  withdrawalRate = 4,
  projectedAtRetirement = 0,
  viewAge = 100,
  onViewAgeChange,
}: GrowthProjectionProps) => {
  const totalAmount = currentSavings + currentInvestments
  const savingsGrowthRate = savingsRate / 100
  const investmentGrowthRate = investmentRate / 100

  // Helper function to calculate future value with compound interest and monthly contributions
  const calculateFutureValue = (
    principalAmount: number,
    monthlyContribution: number,
    annualRate: number,
    years: number
  ): number => {
    if (years <= 0) return principalAmount;
    
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    
    // Future value of principal: P(1 + r)^t
    const futureValuePrincipal = principalAmount * Math.pow(1 + annualRate, years);
    
    // Future value of annuity (monthly contributions): PMT * [((1 + r)^t - 1) / r]
    let futureValueAnnuity = 0;
    if (monthlyRate > 0) {
      futureValueAnnuity = monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    } else {
      futureValueAnnuity = monthlyContribution * months;
    }
    
    return futureValuePrincipal + futureValueAnnuity;
  };

  // Calculate yearly projections with compound interest and monthly contributions
  const generateProjections = () => {
    const projections = []
    const yearsToRetirement = retirementAge - currentAge
    const maxAge = Math.max(viewAge, retirementAge) + 1

    for (let year = 0; year <= maxAge; year++) {
      const age = currentAge + year
      
      if (year <= yearsToRetirement) {
        // Pre-retirement: grow savings and investments with monthly contributions
        const projectedSavings = calculateFutureValue(
          currentSavings,
          monthlyContributionsSavings,
          savingsGrowthRate,
          year
        );
        
        const projectedInvestments = calculateFutureValue(
          currentInvestments,
          monthlyContributionsInvestment,
          investmentGrowthRate,
          year
        );
        
        const total = projectedSavings + projectedInvestments

        projections.push({
          year,
          age,
          savings: Math.round(projectedSavings),
          investments: Math.round(projectedInvestments),
          total: Math.round(total),
        })
      } else {
        // Post-retirement: apply annual withdrawals
        const previousYear = projections[projections.length - 1]
        
          // Calculate annual withdrawal based on rate applied to retirement balance
          const annualWithdrawal: number = projectedAtRetirement * (withdrawalRate / 100)
        
        // Apply annual withdrawal and then growth
        let balance: number = previousYear.total - annualWithdrawal
        balance = Math.max(0, balance) // Can't go below 0
        
        // Grow remaining balance
        const blendedRate = (previousYear.savings / previousYear.total) * savingsGrowthRate +
                           (previousYear.investments / previousYear.total) * investmentGrowthRate
        balance = balance * (1 + blendedRate)
        
        // Split between savings and investments proportionally
        const savingsRatio = previousYear.savings / previousYear.total || 0.5
        const projectedSavings: number = balance * savingsRatio
        const projectedInvestments: number = balance * (1 - savingsRatio)

        projections.push({
          year,
          age,
          savings: Math.round(projectedSavings),
          investments: Math.round(projectedInvestments),
          total: Math.round(balance),
        })
      }
    }

    return projections
  }

  const data = generateProjections()

  if (totalAmount === 0) {
    return (
      <section className="growth-projection">
        <h2>Growth Projection</h2>
        <div className="empty-projection">
          <p>Add accounts to see your growth projection with compound interest</p>
        </div>
      </section>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip">
          <p className="tooltip-age">Age {data.age}</p>
          <p className="tooltip-savings">Savings: ${data.savings.toLocaleString()}</p>
          <p className="tooltip-investments">Investments: ${data.investments.toLocaleString()}</p>
          <p className="tooltip-total">Total: ${data.total.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <section className="growth-projection">
      <h2>Compound Interest Growth Projection</h2>
      <p className="projection-subtitle">
        Annual growth: Savings at {savingsRate}% | Investments at {investmentRate}%
        {(monthlyContributionsSavings > 0 || monthlyContributionsInvestment > 0) && 
          ` | Monthly contributions: $${(monthlyContributionsSavings + monthlyContributionsInvestment).toLocaleString('en-US', {maximumFractionDigits: 0})}`
        }
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorInvestments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="age"
            label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }}
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => {
              if (value === 'savings') return `Savings Account (${savingsRate}% growth)`
              if (value === 'investments') return `Investments (${investmentRate}% growth)`
              return value
            }}
          />
          <ReferenceLine
            x={retirementAge}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `Retirement: ${retirementAge}`,
              position: 'top',
              fill: '#d97706',
              fontSize: 12,
              fontWeight: 600,
              offset: 10,
            }}
          />
          <Area
            type="monotone"
            dataKey="savings"
            stackId="1"
            stroke="#0ea5e9"
            fill="url(#colorSavings)"
            isAnimationActive={true}
            name="savings"
          />
          <Area
            type="monotone"
            dataKey="investments"
            stackId="1"
            stroke="#6366f1"
            fill="url(#colorInvestments)"
            isAnimationActive={true}
            name="investments"
          />
        </AreaChart>
      </ResponsiveContainer>

        {(viewAge > retirementAge || withdrawalRate > 0) && (
        <div className="view-age-slider">
          <label>
            <span>View Projection to Age: <strong>{viewAge}</strong></span>
          </label>
          <input
            type="range"
            min={retirementAge}
            max="100"
            value={viewAge}
            onChange={(e) => onViewAgeChange?.(Number(e.target.value))}
            className="slider"
          />
          <div className="slider-labels">
            <span>Retirement: {retirementAge}</span>
            <span>Age 100</span>
          </div>
        </div>
      )}

      <div className="projection-stats">
        <div className="stat-box">
          <span className="stat-label">Current Total</span>
          <span className="stat-value">
            ${(currentSavings + currentInvestments).toLocaleString('en-US', {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Projected at {retirementAge}</span>
          <span className="stat-value">
            ${data[data.length - 1].total.toLocaleString('en-US', {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Total Growth</span>
          <span className="stat-value growth">
            ${(data[data.length - 1].total - (currentSavings + currentInvestments)).toLocaleString(
              'en-US',
              { maximumFractionDigits: 0 }
            )}
          </span>
        </div>
      </div>
    </section>
  )
}

export default GrowthProjection
