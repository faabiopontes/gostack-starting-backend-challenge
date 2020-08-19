import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const balance = { income: 0, outcome: 0, total: 0 };
    transactions.forEach(transaction => {
      balance[transaction.type] += transaction.value;
      if (transaction.type === 'income') {
        balance.total += transaction.value;
      }
      if (transaction.type === 'outcome') {
        balance.total -= transaction.value;
      }
    });
    return balance;
  }
}

export default TransactionsRepository;
