import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './entities/quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import axios from 'axios';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);
  private readonly quotableApiUrl = 'https://api.quotable.io';

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

  async getRandomQuote(): Promise<Quote | any> {
    try {
      // First try to get from external API (Quotable.io)
      const response = await axios.get(`${this.quotableApiUrl}/random`, {
        timeout: 5000, // 5 second timeout
      });
      const externalQuote = {
        id: response.data._id,
        text: response.data.content,
        author: response.data.author.replace(', type.works', '') || 'Unknown',
        source: 'external',
      };
      this.logger.log(`Fetched quote from Quotable API: ${externalQuote.author}`);
      return externalQuote;
    } catch (error) {
      this.logger.warn(`Failed to fetch from Quotable API, falling back to database: ${error.message}`);
      // Fallback to database quotes
      const quotes = await this.quoteRepository.find();
      if (!quotes.length) {
        // If no quotes in database, seed default motivational quotes
        return await this.seedDefaultQuotes();
      }
      const randomIndex = Math.floor(Math.random() * quotes.length);
      return quotes[randomIndex];
    }
  }

  // Seed default motivational quotes (for offline/fallback)
  private async seedDefaultQuotes(): Promise<Quote> {
    const defaultQuotes = [
      { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
      { text: "It is never too late to be what you might have been.", author: "George Eliot" },
      { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
      { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
      { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
      { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    ];

    const savedQuotes: Quote[] = [];
    for (const quoteData of defaultQuotes) {
      const quote = await this.quoteRepository.save(quoteData);
      savedQuotes.push(quote);
    }

    this.logger.log(`Seeded ${savedQuotes.length} default quotes to database`);
    
    // Return a random one from the newly saved quotes
    const randomIndex = Math.floor(Math.random() * savedQuotes.length);
    return savedQuotes[randomIndex];
  }

  // Fetch from external API and save to database for offline access
  async fetchAndSaveQuotes(limit: number = 10): Promise<Quote[]> {
    try {
      const response = await axios.get(`${this.quotableApiUrl}/quotes`, {
        params: { limit },
        timeout: 10000, // 10 second timeout
      });
      
      const savedQuotes: Quote[] = [];
      for (const quoteData of response.data.results) {
        const quote = await this.quoteRepository.save({
          text: quoteData.content,
          author: quoteData.author.replace(', type.works', '') || 'Unknown',
        });
        savedQuotes.push(quote);
      }
      
      this.logger.log(`Saved ${savedQuotes.length} quotes to database`);
      return savedQuotes;
    } catch (error) {
      this.logger.error(`Failed to fetch quotes from API: ${error.message}`);
      this.logger.warn('Falling back to seeding default quotes');
      // Seed default quotes as fallback
      const defaultQuote = await this.seedDefaultQuotes();
      return [defaultQuote];
    }
  }

  async remove(id: number): Promise<void> {
    const quote = await this.findOne(id);
    await this.quoteRepository.remove(quote);
  }
}