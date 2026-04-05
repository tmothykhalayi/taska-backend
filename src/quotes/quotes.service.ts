import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './entities/quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
  ) {}

  async create(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    const quote = this.quoteRepository.create(createQuoteDto);
    return this.quoteRepository.save(quote);
  }

  findAll(): Promise<Quote[]> {
    return this.quoteRepository.find();
  }

  async findOne(id: number): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({ where: { id } });
    if (!quote) throw new NotFoundException(`Quote with id ${id} not found`);
    return quote;
  }

  async getRandomQuote(): Promise<Quote> {
    const quotes = await this.quoteRepository.find();
    if (!quotes.length) throw new NotFoundException('No quotes available');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }

  async remove(id: number): Promise<void> {
    const quote = await this.findOne(id);
    await this.quoteRepository.remove(quote);
  }
}