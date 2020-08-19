import { v4 } from 'uuid';
import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
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
    const balance = await transactionRepository.getBalance();
    let categoryModel = await categoryRepository.findOne({ title: category });
    if (!categoryModel) {
      // se a categoria não existe temos que cria-la
      categoryModel = categoryRepository.create();
      categoryModel.title = category;
      await categoryRepository.save(categoryModel);
    }

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Balance is lower than transaction value', 400);
    }

    const transaction = transactionRepository.create({
      id: v4(),
      title,
      value,
      type,
      category_id: categoryModel.id,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
