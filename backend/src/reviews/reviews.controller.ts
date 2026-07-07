import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtUser } from '../common/types/jwt-user.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user, dto);
  }

  @Get('event/:eventId')
  getByEvent(@Param('eventId') eventId: string) {
    return this.reviewsService.getByEvent(eventId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyReviews(@CurrentUser() user: JwtUser) {
    return this.reviewsService.getMyReviews(user);
  }
}
