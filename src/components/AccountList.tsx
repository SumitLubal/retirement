import './AccountList.css'

interface Account {
  id: string
  name: string
  type: 'savings' | 'investment' | '401k' | 'roth-ira'
  amount: number
  monthlyContribution: number
}

interface AccountListProps {
  accounts: Account[]
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<Account>) => void
}

const getTypeEmoji = (type: string) => {
  switch (type) {
    case 'savings':
      return '💳'
    case 'investment':
      return '📈'
    case '401k':
      return '🏢'
    case 'roth-ira':
      return '🛡️'
    default:
      return '💰'
  }
}

const getTypeName = (type: string) => {
  switch (type) {
    case 'savings':
      return 'Savings'
    case 'investment':
      return 'Investment'
    case '401k':
      return '401(k)'
    case 'roth-ira':
      return 'Roth IRA'
    default:
      return type
  }
}

const AccountList = ({ accounts, onDelete, onUpdate }: AccountListProps) => {
  if (accounts.length === 0) {
    return <div className="empty-state">No accounts yet. Add one to get started!</div>
  }

  return (
    <div className="account-list">
      {accounts.map((account) => (
        <div key={account.id} className="account-item">
          <div className="account-header">
            <div className="account-info">
              <span className="account-type">{getTypeEmoji(account.type)} {getTypeName(account.type)}</span>
              <span className="account-name">{account.name}</span>
            </div>
          </div>
          <div className="account-amounts">
            <div className="amount-field">
              <label className="field-label">Current</label>
              <input
                type="number"
                value={account.amount}
                onChange={(e) => onUpdate(account.id, { amount: parseFloat(e.target.value) || 0 })}
                className="amount-input"
                step="0.01"
                min="0"
              />
            </div>
            <div className="amount-field">
              <label className="field-label">Monthly</label>
              <input
                type="number"
                value={account.monthlyContribution}
                onChange={(e) => onUpdate(account.id, { monthlyContribution: parseFloat(e.target.value) || 0 })}
                className="amount-input"
                step="0.01"
                min="0"
              />
            </div>
            <button
              onClick={() => onDelete(account.id)}
              className="btn-delete"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AccountList
