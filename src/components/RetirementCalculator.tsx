import { useState, useEffect } from 'react'
import AccountList from './AccountList'
import AccountForm from './AccountForm'
import RetirementChart from './RetirementChart'
import GrowthProjection from './GrowthProjection'
import './RetirementCalculator.css'

interface Account {
  id: string
  name: string
  type: 'savings' | 'investment' | '401k' | 'roth-ira'
  amount: number
  monthlyContribution: number
}

interface RetirementData {
  accounts: Account[]
  currentAge: number
  retirementAge: number
  investmentRate: number
  savingsRate: number
  withdrawalRate: number
}

const STORAGE_KEY = 'retirement-planner-data'

// Load initial state from localStorage
const loadInitialState = (): RetirementData => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      const parsed = JSON.parse(savedData)
      return {
        accounts: parsed.accounts || [],
        currentAge: parsed.currentAge || 30,
        retirementAge: parsed.retirementAge || 65,
        investmentRate: parsed.investmentRate || 5,
        savingsRate: parsed.savingsRate || 2,
        withdrawalRate: parsed.withdrawalRate || 4,
      }
    }
  } catch (error) {
    console.error('Failed to load saved data:', error)
  }
  return {
    accounts: [],
    currentAge: 30,
    retirementAge: 65,
    investmentRate: 5,
    savingsRate: 2,
    withdrawalRate: 4,
  }
}

const RetirementCalculator = () => {
  const initialState = loadInitialState()
  const [accounts, setAccounts] = useState<Account[]>(initialState.accounts)
  const [currentAge, setCurrentAge] = useState(initialState.currentAge)
  const [retirementAge, setRetirementAge] = useState(initialState.retirementAge)
  const [investmentRate, setInvestmentRate] = useState(initialState.investmentRate)
  const [savingsRate, setSavingsRate] = useState(initialState.savingsRate)
  const [withdrawalRate, setWithdrawalRate] = useState(initialState.withdrawalRate)
  const [viewAge, setViewAge] = useState(initialState.retirementAge)

  // Update viewAge when retirement age changes
  useEffect(() => {
    setViewAge(retirementAge)
  }, [retirementAge])

  // Save data to localStorage whenever any field changes
  useEffect(() => {
    try {
      const dataToSave: RetirementData = {
        accounts,
        currentAge,
        retirementAge,
        investmentRate,
        savingsRate,
        withdrawalRate,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    } catch (error) {
      console.error('Failed to save data:', error)
    }
  }, [accounts, currentAge, retirementAge, investmentRate, savingsRate, withdrawalRate])

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    }
    setAccounts([...accounts, newAccount])
  }

  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter(acc => acc.id !== id))
  }

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(accounts.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    ))
  }

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all saved data?')) {
      setAccounts([])
      setRetirementAge(65)
      setInvestmentRate(5)
      setSavingsRate(2)
      localStorage.removeItem(STORAGE_KEY)
    }
  }
  // Calculate totals
  const totalSavings = accounts
    .filter(a => a.type === 'savings')
    .reduce((sum, a) => sum + a.amount, 0)

  const totalInvestments = accounts
    .filter(a => a.type === 'investment')
    .reduce((sum, a) => sum + a.amount, 0)

  const total401k = accounts
    .filter(a => a.type === '401k')
    .reduce((sum, a) => sum + a.amount, 0)

  const totalRothIRA = accounts
    .filter(a => a.type === 'roth-ira')
    .reduce((sum, a) => sum + a.amount, 0)

  // Calculate total monthly contributions by type
  const monthlyContributionsSavings = accounts
    .filter(a => a.type === 'savings')
    .reduce((sum, a) => sum + a.monthlyContribution, 0)

  const monthlyContributionsInvestment = accounts
    .filter(a => a.type === 'investment')
    .reduce((sum, a) => sum + a.monthlyContribution, 0)

  const monthlyContributions401k = accounts
    .filter(a => a.type === '401k')
    .reduce((sum, a) => sum + a.monthlyContribution, 0)

  const monthlyContributionsRothIRA = accounts
    .filter(a => a.type === 'roth-ira')
    .reduce((sum, a) => sum + a.monthlyContribution, 0)

  const totalAmount = totalSavings + totalInvestments + total401k + totalRothIRA
  const yearsToRetirement = retirementAge - currentAge

  // Use slider values for growth rates
  const investmentGrowthRate = investmentRate / 100
  const savingsGrowthRate = savingsRate / 100
  
  // Helper function to calculate future value with compound interest and monthly contributions
  const calculateFutureValue = (
    principalAmount: number,
    monthlyContribution: number,
    annualRate: number,
    years: number
  ): number => {
    if (years <= 0) return principalAmount + monthlyContribution * 12;
    
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
  
  const projectedInvestmentValue = calculateFutureValue(
    totalInvestments + total401k + totalRothIRA,
    monthlyContributionsInvestment + monthlyContributions401k + monthlyContributionsRothIRA,
    investmentGrowthRate,
    yearsToRetirement
  );
  
  const projectedSavings = calculateFutureValue(
    totalSavings,
    monthlyContributionsSavings,
    savingsGrowthRate,
    yearsToRetirement
  );
  
  const projectedTotal = projectedInvestmentValue + projectedSavings

  // Detailed yearly simulation for the retirement sheet (until age 100)
  const simulateYearly = () => {
    const rows: Array<any> = []
    const yearsToRetirement = retirementAge - currentAge
    const endAge = 100
    const totalYears = endAge - currentAge

    const annualContribSavings = monthlyContributionsSavings * 12
    const annualContribInvestment = (monthlyContributionsInvestment + monthlyContributions401k + monthlyContributionsRothIRA) * 12

    // start balances
    let bs = totalSavings
    let bi = totalInvestments + total401k + totalRothIRA

    const annualWithdrawal = projectedTotal * (withdrawalRate / 100)

    for (let y = 0; y <= totalYears; y++) {
      const age = currentAge + y
      const startTotal = bs + bi

      // blended return for display purposes
      const blendedRate = startTotal > 0 ? ((bs / startTotal) * savingsGrowthRate + (bi / startTotal) * investmentGrowthRate) : (investmentGrowthRate + savingsGrowthRate) / 2

      let contributions = 0
      let employerMatch = 0
      let payout = 0
      let interestEarned = 0

      if (y <= yearsToRetirement) {
        // pre-retirement: add contributions then grow
        bs = bs + annualContribSavings
        bi = bi + annualContribInvestment

        const bsAfter = bs * (1 + savingsGrowthRate)
        const biAfter = bi * (1 + investmentGrowthRate)

        interestEarned = (bsAfter - bs) + (biAfter - bi)

        bs = bsAfter
        bi = biAfter

        contributions = annualContribSavings + annualContribInvestment
      } else {
        // post-retirement: withdraw then grow
        const startTotalBefore = bs + bi
        const withdrawal = Math.min(startTotalBefore, annualWithdrawal)
        payout = withdrawal

        const totalAfterWithdrawal = Math.max(0, startTotalBefore - withdrawal)
        const savingsRatio = startTotalBefore > 0 ? bs / startTotalBefore : 0.5
        const bsPreGrow = totalAfterWithdrawal * savingsRatio
        const biPreGrow = totalAfterWithdrawal * (1 - savingsRatio)

        const bsAfter = bsPreGrow * (1 + savingsGrowthRate)
        const biAfter = biPreGrow * (1 + investmentGrowthRate)

        interestEarned = (bsAfter - bsPreGrow) + (biAfter - biPreGrow)

        bs = bsAfter
        bi = biAfter
      }

      rows.push({
        year: y,
        age,
        returnPct: blendedRate * 100,
        salaryBasis: startTotal,
        annualContribution: contributions,
        employerMatch,
        retirementIncome: y > yearsToRetirement ? annualWithdrawal : 0,
        payout,
        interestEarned,
        balance: bs + bi,
      })
    }

    return rows
  }

  const detailedRows = simulateYearly()

  // Calculate annual withdrawal based on withdrawal rate
  const annualWithdrawal = projectedTotal * (withdrawalRate / 100)

  return (
    <div className="calculator-container">
      <header className="calculator-header">
        <div className="header-content">
          <div>
            <h1>💰 Retirement Planner</h1>
            <p>Plan your retirement by tracking your accounts</p>
          </div>
          <button className="btn-clear" onClick={clearAllData} title="Clear all saved data">
            🗑️
          </button>
        </div>
      </header>

      <GrowthProjection
        currentSavings={totalSavings}
        currentInvestments={totalInvestments + total401k + totalRothIRA}
        monthlyContributionsSavings={monthlyContributionsSavings}
        monthlyContributionsInvestment={monthlyContributionsInvestment + monthlyContributions401k + monthlyContributionsRothIRA}
        retirementAge={retirementAge}
        currentAge={currentAge}
        investmentRate={investmentRate}
        savingsRate={savingsRate}
        withdrawalRate={withdrawalRate}
        viewAge={viewAge}
        onViewAgeChange={setViewAge}
        projectedAtRetirement={projectedTotal}
      />

      <div className="calculator-content">
        <div className="left-panel">
          <section className="controls">
            <div className="retirement-age-control">
              <label>
                <span>Your Age: <strong>{currentAge}</strong></span>
                <p className="subtitle">Current age</p>
              </label>
              <input
                type="range"
                min="18"
                max="80"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="retirement-age-control">
              <label>
                <span>Retirement Age: <strong>{retirementAge}</strong></span>
                <p className="subtitle">Years until retirement: {yearsToRetirement}</p>
              </label>
              <input
                type="range"
                min="32"
                max="80"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="rate-control">
              <label>
                <span>Investment Growth Rate: <strong>{investmentRate}%</strong></span>
                <p className="subtitle">Annual return on investments & 401k</p>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                value={investmentRate}
                onChange={(e) => setInvestmentRate(Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="rate-control">
              <label>
                <span>Savings Growth Rate: <strong>{savingsRate}%</strong></span>
                <p className="subtitle">Annual interest on savings accounts</p>
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={savingsRate}
                onChange={(e) => setSavingsRate(Number(e.target.value))}
                className="slider"
              />
            </div>

            <div className="rate-control">
              <label>
                <span>Withdrawal Rate: <strong>{withdrawalRate}%</strong></span>
                <p className="subtitle">Annual % of retirement balance to withdraw (4% rule)</p>
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={withdrawalRate}
                onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                className="slider"
              />
            </div>
          </section>

          <section className="form-section">
            <h2>Add Account</h2>
            <AccountForm onAdd={addAccount} />
          </section>
        </div>

        <div className="middle-panel">
          <section className="projection">
            <h2>Retirement Projection</h2>
            <div className="projection-info">
              <p>Estimated value at age <strong>{retirementAge}</strong> (in {yearsToRetirement} years):</p>
              <div className="projection-total">
                ${projectedTotal.toLocaleString('en-US', {maximumFractionDigits: 0})}
              </div>
              <p className="projection-subtitle">Based on {investmentRate}% investment growth & {savingsRate}% savings growth</p>
            </div>
          </section>

          <RetirementChart 
            savings={totalSavings}
            investments={totalInvestments + total401k + totalRothIRA}
            projectedSavings={projectedSavings}
            projectedInvestments={projectedInvestmentValue}
          />

          <section className="accounts-section">
            <h2>Your Accounts</h2>
            <AccountList 
              accounts={accounts}
              onDelete={deleteAccount}
              onUpdate={updateAccount}
            />
          </section>
        </div>

        <div className="right-panel">
          <section className="summary">
            <h2>Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Savings</span>
                <span className="value">${totalSavings.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
              </div>
              <div className="summary-item">
                <span className="label">Investments</span>
                <span className="value">${totalInvestments.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
              </div>
              <div className="summary-item">
                <span className="label">401(k)</span>
                <span className="value">${total401k.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
              </div>
              <div className="summary-item">
                <span className="label">Roth IRA</span>
                <span className="value">${totalRothIRA.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
              </div>
              <div className="summary-item total">
                <span className="label">Total Today</span>
                <span className="value">${totalAmount.toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

        <section className="retirement-summary-sheet">
          <h2>Retirement Income Analysis</h2>
          <div className="summary-table">
            <div className="table-row">
              <div className="table-cell label">Projected Balance at Retirement (Age {retirementAge})</div>
              <div className="table-cell value">${projectedTotal.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
            </div>
            <div className="table-row">
              <div className="table-cell label">Withdrawal Rate</div>
              <div className="table-cell value">{withdrawalRate}% per year</div>
            </div>
            <div className="table-row">
              <div className="table-cell label">Annual Withdrawal Amount</div>
              <div className="table-cell value">${annualWithdrawal.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
            </div>
            <div className="table-row">
              <div className="table-cell label">Monthly Income</div>
              <div className="table-cell value">${(annualWithdrawal / 12).toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
            </div>
            <div className="table-row">
              <div className="table-cell label">Safe Withdrawal</div>
              <div className="table-cell value">{withdrawalRate <= 4 ? '✓ Conservative' : withdrawalRate <= 5 ? '⚠ Moderate Risk' : '⚠ High Risk'}</div>
            </div>
          </div>
          <p className="sheet-note">
            The 4% rule suggests withdrawing 4% of your retirement balance annually has historically lasted 30+ years. 
            Higher withdrawal rates increase the risk of running out of money.
          </p>
        </section>
        <section className="retirement-detailed-sheet">
          <h2>Yearly Projection Table (to age 100)</h2>
          <div className="detailed-table-wrapper">
            <table className="detailed-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Age</th>
                  <th>Return %</th>
                  <th>Salary Basis</th>
                  <th>Annual Contribution</th>
                  <th>Employer Match</th>
                  <th>Retirement Income</th>
                  <th>Payout (Withdrawal)</th>
                  <th>Interest Earned</th>
                  <th>Balance (Current Scenario)</th>
                </tr>
              </thead>
              <tbody>
                {detailedRows.map((r: any) => (
                  <tr key={`${r.age}-${r.year}`}>
                    <td>{r.year}</td>
                    <td>{r.age}</td>
                    <td>{r.returnPct.toFixed(2)}%</td>
                    <td>${Math.round(r.salaryBasis).toLocaleString('en-US')}</td>
                    <td>${Math.round(r.annualContribution).toLocaleString('en-US')}</td>
                    <td>${Math.round(r.employerMatch).toLocaleString('en-US')}</td>
                    <td>${Math.round(r.retirementIncome).toLocaleString('en-US')}</td>
                    <td>${Math.round(r.payout).toLocaleString('en-US')}</td>
                    <td>${Math.round(r.interestEarned).toLocaleString('en-US')}</td>
                    <td>${Math.round(r.balance).toLocaleString('en-US')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    </div>
  )
}

export default RetirementCalculator
