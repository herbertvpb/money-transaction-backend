import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';
import CreateImportedTransactionService from './CreateImportedTransactionService';

interface Request {
  filename: string;
}

interface ImportedTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const categories: string[] = [];
    const transactions: ImportedTransaction[] = [];

    const categoriesRepository = getCustomRepository(CategoriesRepository);

    parseCSV.on('data', async line => {
      const transaction = {
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      };

      if (!categories.includes(transaction.category))
        categories.push(transaction.category);

      transactions.push(transaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const categoryPromises = categories.map(category =>
      categoriesRepository.findCategoryByTitle(category),
    );

    await Promise.all(categoryPromises);

    const createTransaction = new CreateImportedTransactionService();

    const transactionPromises = transactions.map(transaction =>
      createTransaction.execute(transaction),
    );

    const createdTransactions = await Promise.all(transactionPromises);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
