import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    return transactions.reduce(
      (acc: Balance, current: CreateTransactionDTO) => {
        if (current.type === 'income') acc.income += current.value;
        else {
          acc.outcome += current.value;
        }
        const total = acc.income - acc.outcome;

        return { ...acc, total };
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
  }
}

export default TransactionsRepository;
