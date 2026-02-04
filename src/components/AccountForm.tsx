import { useState } from 'react'
import './AccountForm.css'

interface AccountFormProps {
  onAdd: (account: {
    name: string
    type: 'savings' | 'investment' | '401k' | 'roth-ira'
    amount: number
    monthlyContribution: number
  }) => void
}

const AccountForm = ({ onAdd }: AccountFormProps) => {
  const [name, setName] = useState('')
  const [type, setType] = useState<'savings' | 'investment' | '401k' | 'roth-ira'>('savings')
  const [amount, setAmount] = useState('')
  const [monthlyContribution, setMonthlyContribution] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount) return

    onAdd({
      name,
      type,
      amount: parseFloat(amount),
      monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : 0,
    })

    setName('')
    setType('savings')
    setAmount('')
    setMonthlyContribution('')
  }

  return (
    <form onSubmit={handleSubmit} className="account-form">
      <div className="form-group">
        <label>Account Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Chase Savings, Vanguard ETF"
          required
        />
      </div>

      <div className="form-group">
        <label>Account Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="savings">💳 Savings Account</option>
          <option value="investment">📈 Investments</option>
          <option value="401k">🏢 401(k)</option>
          <option value="roth-ira">🛡️ Roth IRA</option>
        </select>
      </div>

      <div className="form-group">
        <label>Current Amount ($)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          required
        />
      </div>

      <div className="form-group">
        <label>Monthly Contribution ($)</label>
        <input
          type="number"
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
      </div>

      <button type="submit" className="btn-submit">Add Account</button>
    </form>
  )
}

export default AccountForm
