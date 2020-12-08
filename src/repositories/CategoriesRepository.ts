import { EntityRepository, Repository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findCategoryByTitle(title: string): Promise<Category | null> {
    const findCategory = await this.findOne({
      where: { title },
    });

    if (findCategory) return findCategory;

    const category = this.create({ title });
    await this.save(category);

    const newCategory = await this.findOne({
      where: { title },
    });

    return newCategory || null;
  }
}

export default CategoriesRepository;
