import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(createQuoteDto);
  }

  @Get()
  findAll() {
    return this.quotesService.findAll();
  }

  @Get('random')
  getRandomQuote() {
    return this.quotesService.getRandomQuote();
  }

  @Post('fetch-from-api')
  async fetchAndSaveQuotes(@Query('limit') limit: string = '10') {
    return this.quotesService.fetchAndSaveQuotes(parseInt(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(+id);
  }
}