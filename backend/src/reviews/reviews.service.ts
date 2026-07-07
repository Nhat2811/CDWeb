import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingsService } from '../bookings/bookings.service';
import { EventsService } from '../events/events.service';
import { JwtUser } from '../common/types/jwt-user.type';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    private readonly bookingsService: BookingsService,
    private readonly eventsService: EventsService,
  ) {}

  async create(user: JwtUser, dto: CreateReviewDto) {
    const booking = await this.bookingsService.findOneForUser(dto.bookingId, user);
    
    if (booking.status !== 'used') {
      throw new BadRequestException('You can only review an event after attending it (status must be used)');
    }

    const existingReview = await this.reviewModel.findOne({ booking: new Types.ObjectId(dto.bookingId) });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this booking');
    }

    const review = await this.reviewModel.create({
      user: new Types.ObjectId(user.sub),
      event: (booking.event as any)._id,
      booking: new Types.ObjectId(dto.bookingId),
      rating: dto.rating,
      comment: dto.comment,
    });

    // Optionally update event average rating
    await this.updateEventRating((booking.event as any)._id.toString());

    return review;
  }

  async getByEvent(eventId: string) {
    return this.reviewModel
      .find({ event: new Types.ObjectId(eventId) })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getMyReviews(user: JwtUser) {
    return this.reviewModel
      .find({ user: new Types.ObjectId(user.sub) })
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .exec();
  }

  private async updateEventRating(eventId: string) {
    const reviews = await this.reviewModel.find({ event: new Types.ObjectId(eventId) });
    const totalReviews = reviews.length;
    
    let averageRating = 0;
    if (totalReviews > 0) {
      averageRating = reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews;
    }
    
    await this.eventsService.updateEventStats(eventId, averageRating, totalReviews);
  }
}
