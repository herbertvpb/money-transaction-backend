// import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    await transactionsRepository.delete({ id });
  }
}

export default DeleteTransactionService;
