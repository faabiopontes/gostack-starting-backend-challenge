import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(file: Express.Multer.File): Promise<Transaction[]> {
    let transactions: Transaction[] = [];
    const createTransactionService = new CreateTransactionService();
    const csvFilePath = path.resolve(__dirname, '..', '..', file.path);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);
    const promises: Array<Promise<Transaction>> = [];

    parseCSV.on('data', ([title, type, value, category]) => {
      promises.push(
        createTransactionService.execute({
          title,
          value,
          type,
          category,
        }),
      );
    });
    await new Promise(resolve => {
      parseCSV.on('end', async () => {
        transactions = await Promise.all(promises);
        resolve();
      });
    });
    return transactions;
  }
}

export default ImportTransactionsService;
