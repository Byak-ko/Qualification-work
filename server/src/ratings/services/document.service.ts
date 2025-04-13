import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { File } from 'multer';
import { Document } from 'src/entities/document.entity';
import { Rating, RatingStatus } from 'src/entities/rating.entity';
import { RatingResponse } from 'src/entities/rating-response.entity';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const fileFilter = (req: any, file: File, callback: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new BadRequestException(`Дозволені лише наступні типи файлів: ${allowedMimeTypes.join(', ')}`),
      false
    );
  }
  callback(null, true);
};

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document) private documentRepository: Repository<Document>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(RatingResponse)
    private ratingResponseRepository: Repository<RatingResponse>,
  ) { }

  async uploadDocument(file: File) {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Дозволені лише наступні типи файлів: ${ALLOWED_FILE_TYPES.join(', ')}`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`Розмір файлу не може перевищувати ${MAX_FILE_SIZE / (1024 * 1024)} МБ`);
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const fileExt = path.extname(originalName);
    const uniqueId = uuidv4();
    const sanitizedName = path.basename(originalName, fileExt)
      .replace(/[^a-zA-Z0-9а-яА-ЯіІїЇєЄґҐ]/g, '_')
      .substring(0, 50);

    const fileName = `${uniqueId}-${sanitizedName}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    const url = `/uploads/${fileName}`;
    const document = this.documentRepository.create({
      url,
      title: originalName
    });
    await this.documentRepository.save(document);

    return { url, id: document.id, title: originalName };
  }

  async getDocument(id: string) {
    const document = await this.documentRepository.findOne({ where: { id: +id } });
    if (!document) {
      throw new NotFoundException('Документ не знайдено');
    }
    return document;
  }

  async deleteAllRatingDocuments(ratingId: number): Promise<{ success: boolean; message: string }> {

    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId },
      select: ['id', 'status'],
    });

    if (!rating) {
      throw new NotFoundException(`Рейтинг з ID ${ratingId} не знайдено`);
    }

    if (rating.status !== RatingStatus.CLOSED) {
      throw new Error(`Видалення документів можливе лише для закритих рейтингів`);
    }

    try {
      const responses = await this.ratingResponseRepository.find({
        where: { rating: { id: ratingId } },
      });

      const updatePromises = responses.map(async (response) => {
        response.documents = {};
        return this.ratingResponseRepository.save(response);
      });

      await Promise.all(updatePromises);

      return {
        success: true,
        message: `Всі документи для рейтингу з ID ${ratingId} успішно видалено`,
      };
    } catch (error) {
      console.error(`Помилка під час видалення документів рейтингу: ${error.message}`);
      throw new Error(`Помилка під час видалення документів рейтингу: ${error.message}`);
    }
  }
}