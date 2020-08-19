// import AppError from '../errors/AppError';

import { v4 } from 'uuid';
import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

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
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    let categoryModel = await categoryRepository.findOne({ title: category });
    if (!categoryModel) {
      // se a categoria não existe temos que cria-la
      categoryModel = categoryRepository.create();
      categoryModel.title = category;
      await categoryRepository.save(categoryModel);
    }

    const transaction = transactionRepository.create();
    transaction.id = v4();
    transaction.title = title;
    transaction.value = value;
    transaction.type = type;
    transaction.category_id = categoryModel.id;
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
