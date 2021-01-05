import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const findCategory = await categoriesRepository.findCategoryByTitle(
      category,
    );

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total)
      throw new AppError(
        'Outcome value cannot be greater than the current balance',
        400,
      );

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: findCategory ? findCategory.id : '',
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
